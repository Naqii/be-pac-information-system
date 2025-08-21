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

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id,
      } as TypeAttendance;
      await attendanceDTO.validate(payload);

      const existed = await AttendanceModel.findOne({
        name: payload.name,
        class: payload.classId,
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
      } else if (!month){
        return response.notFound(res, 'month is required');
      } else if (!year) {
        return response.notFound(res, 'year is required');
      };

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
        const row: any = { name: d.name, dates: {} };
        
        //set default kosong untuk semua hari
        for (let i = 1; i <= daysInMonth; i++) {
          row.dates[i] = { status: '', description: ''};
        };
        
        //pengisian presensi yang ada
        (d.attendance || []).forEach((a: any) => {
          const dt = new Date(a.date);
          if (dt >= start && dt < end) {
            const idx = dt.getDate();
            row.dates[idx] = {
              status: (a.status || '').toString().toUpperCase().charAt(0),
              description: a.description || ''
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
      const { classId, month, year } = req.query as any;
      if (!classId) {
        return response.notFound(res, 'classId is required');
      } else if (!month){
        return response.notFound(res, 'month is required');
      } else if (!year) {
        return response.notFound(res, 'year is required');
      };
      
    } catch (error) {
      
    }
  }
};
