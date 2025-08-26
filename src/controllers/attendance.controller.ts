import AttendanceModel, {
  attendanceDTO,
  attendanceItemDTO,
  TypeAttendance,
  TypeStudentAttendance,
} from '../models/attendance.model';
import { IReqUser } from '../utils/interface';
import { Response } from 'express';
import response from '../utils/response';
import { FilterQuery } from 'mongoose';
import ExcelJS from 'exceljs';
import StudentModel from '../models/student.model';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id,
      } as TypeAttendance;
      await attendanceDTO.validate(payload);

      const user = await StudentModel.findById(payload.fullName).select(
        'fullName'
      );
      if (!user) return response.notFound(res, 'Student not found');

      payload.fullName = user.fullName;

      const existed = await AttendanceModel.findOne({
        name: payload.fullName,
        class: payload.className,
      });
      if (existed)
        return response.conflict(res, 'attendance doc already existed');

      const result = await AttendanceModel.create(payload);
      return response.success(res, result, 'success to create attendance doc');
    } catch (error) {
      return response.error(res, error, 'failed to create attendance doc');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeAttendance> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

      const result = await AttendanceModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await AttendanceModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'Successfully retrieved all orders'
      );
    } catch (error) {}
  },
  async upsertAttendance(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const newAttendance = req.body as TypeStudentAttendance;
      await attendanceItemDTO.validate(newAttendance);

      let updated =
        (await AttendanceModel.findOneAndUpdate(
          { _id: id, 'attendance.date': newAttendance.date },
          {
            $set: {
              'attendance.$.status': newAttendance.status,
              'attendance.$.description': newAttendance.description || '',
            },
          },
          {
            new: true,
          }
        )) ||
        (await AttendanceModel.findByIdAndUpdate(
          id,
          { $push: { attendance: newAttendance } },
          {
            new: true,
          }
        ));

      if (!updated) return response.notFound(res, 'attendance doc not found');
      return response.success(res, updated, 'upsert attendance item');
    } catch (error) {
      return response.error(res, error, 'failed upsert attendance item');
    }
  },
  async recapByClassMonth(req: IReqUser, res: Response) {
    try {
      const { classId, month, year } = req.query as any;
      if (!classId) {
        return response.notFound(res, 'classId is required');
      } else if (!month) {
        return response.notFound(res, 'month is required');
      } else if (!year) {
        return response.notFound(res, 'year is required');
      }

      //hitungan awal dan akhir bulan
      const m = Number(month) - 1;
      const y = Number(year);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);

      //data yang diambil masih akan diedit jadi gunakan lean() outputnya plain object bukan instance
      const docs = await AttendanceModel.find({ classId: classId }).lean();
      //menghitung jumlah hari dalam satu bulan
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      //membuat struktur rekapnya
      const rows = docs.map((d) => {
        const row: any = { name: d.fullName, dates: {} };

        //set default kosong untuk semua hari
        for (let i = 1; i <= daysInMonth; i++) {
          row.dates[i] = { status: '', description: '' };
        }

        //pengisian presensi yang ada
        (d.attendance || []).forEach((a: any) => {
          const dt = new Date(a.date);
          if (dt >= start && dt < end) {
            const idx = dt.getDate();
            row.dates[idx] = {
              status: (a.status || '').toString().toUpperCase().charAt(0),
              description: a.description || '',
            };
          }
        });
        return row;
      });
      return response.success(
        res,
        { daysInMonth, attendance: rows },
        'recap attendance'
      );
    } catch (error) {
      return response.error(res, error, 'failed get recap');
    }
  },
  async exportExcel(req: IReqUser, res: Response) {
    try {
      const { classId, month, year } = req.query as Record<string, string>;
      if (!classId) return response.notFound(res, 'classId is required');
      if (!month) return response.notFound(res, 'month is required');
      if (!year) return response.notFound(res, 'year is required');

      const m = Number(month) - 1;
      const y = Number(year);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      const monthName = start.toLocaleString('id-ID', { month: 'long' });

      const docs = await AttendanceModel.find({ classId }).lean();

      const daysInMonth = new Date(y, m + 1, 0).getDate();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Rekap');

      // Setup columns
      // Merge first two rows for the "Name" column, and include classId in the header
      worksheet.mergeCells(1, 1, 2, 1);
      worksheet.getCell(1, 1).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      worksheet.getCell(1, 1).font = { bold: true, size: 12 };

      const columns = [
        { header: 'Name', key: 'name', width: 28 }, // header left empty, merged cell will show "Name (classId)"
        ...Array.from({ length: daysInMonth }, (_, i) => ({
          header: String(i + 1),
          key: `d${i + 1}`,
          width: 4,
        })),
      ];
      worksheet.columns = columns;

      // Merge and set month name
      worksheet.mergeCells(1, 2, 1, daysInMonth + 1);
      const monthCell = worksheet.getCell(1, 2);
      monthCell.value = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      monthCell.alignment = { horizontal: 'center', vertical: 'middle' };
      monthCell.font = { bold: true, size: 12 };

      // Set header alignment
      worksheet.getCell(2, 1).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      for (let i = 1; i <= daysInMonth; i++) {
        const cell = worksheet.getCell(2, i + 1);
        cell.value = i;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Fill attendance data
      docs.forEach((doc) => {
        const row: Record<string, any> = { name: doc.fullName };
        for (let i = 1; i <= daysInMonth; i++) row[`d${i}`] = '';

        (doc.attendance || []).forEach((a: any) => {
          const dt = new Date(a.date);
          if (dt >= start && dt < end) {
            const idx = dt.getDate();
            row[`d${idx}`] = (a.status || '')
              .toString()
              .toUpperCase()
              .charAt(0);
          }
        });

        worksheet.addRow(row);
      });

      // Add description row
      const descriptionRow: Record<string, any> = { name: 'Keterangan' };
      for (let i = 1; i <= daysInMonth; i++) {
        const desc =
          docs[0]?.attendance?.find(
            (a: any) => new Date(a.date).getDate() === i
          )?.description || '';
        descriptionRow[`d${i}`] = desc;
      }
      worksheet.addRow(descriptionRow);

      // Style all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          if (rowNumber === worksheet.rowCount) {
            cell.alignment = {
              textRotation: 90,
              vertical: 'middle',
              horizontal: 'center',
              wrapText: true,
            };
            cell.font = { size: 11 };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });

      const fileName = `rekap-absensi-${classId}-${year}-${month}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      return response.error(res, error, 'failed to export excel');
    }
  },
  async removeItem(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const { date } = req.body as any;
      console.log(date);
      if (!date) return response.notFound(res, 'date is required');

      const result = await AttendanceModel.findByIdAndUpdate(
        id,
        { $pull: { attendance: { date: new Date(date) } } },
        { new: true }
      );

      if (!result) return response.notFound(res, 'attendance doc not found');
      return response.success(res, result, 'remove attendance item');
    } catch (error) {
      return response.error(res, error, 'failed remove item');
    }
  },
};
