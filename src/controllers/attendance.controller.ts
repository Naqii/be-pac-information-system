import AttendanceModel, {
  attendanceDTO,
  attendanceItemDTO,
  TypeAttendance,
  TypeStudentAttendance,
} from '../models/attendance.model';
import { IReqUser } from '../utils/interface';
import { Response } from 'express';
import response from '../utils/response';

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
        class: payload.class,
      });
      if (existed)
        return response.conflict(res, 'attendance doc already existed');

      const result = await AttendanceModel.create(payload);
      return response.success(res, result, 'success to create attendance doc');
    } catch (error) {
      return response.error(res, error, 'failed to create attendance doc');
    }
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
};
