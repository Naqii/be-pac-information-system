import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { CLASS_MODEL_NAME } from './class.model';
import { USER_MODEL_NAME } from './user.model';

export const ATTENDANCE_MODEL_NAME = 'Attendance';

export const attendanceDTO = Yup.object({
  fullName: Yup.string().required(),
  classId: Yup.string().required(),
});

export enum AttendanceStatus {
  H = 'hadir',
  I = 'izin',
  A = 'absen',
}

export const attendanceItemDTO = Yup.object({
  date: Yup.date().required(),
  status: Yup.mixed<AttendanceStatus>()
    .oneOf(Object.values(AttendanceStatus))
    .required(),
  description: Yup.string().required(),
});

export type TypeAttendance = Yup.InferType<typeof attendanceDTO>;

export type TypeStudentAttendance = {
  date: string;
  status: string;
  description: string;
};

export interface Attendance
  extends Omit<TypeAttendance, 'createdBy' | 'classId' | 'fullName'> {
  fullName: ObjectId;
  createdBy: ObjectId;
  classId: ObjectId;
  attendance: TypeStudentAttendance[];
}

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema<Attendance>(
  {
    fullName: {
      type: Schema.Types.String,
      ref: 'Student',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: CLASS_MODEL_NAME,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
    attendance: {
      type: [
        {
          date: {
            type: Schema.Types.Date,
            required: true,
          },
          status: {
            type: Schema.Types.String,
            enum: [AttendanceStatus.H, AttendanceStatus.I, AttendanceStatus.A],
            default: 'absen',
          },
          description: {
            type: Schema.Types.String,
            default: 'Pengajian Umum',
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
).index({ name: 'text' });

const AttendanceModel = mongoose.model(ATTENDANCE_MODEL_NAME, AttendanceSchema);
export default AttendanceModel;
