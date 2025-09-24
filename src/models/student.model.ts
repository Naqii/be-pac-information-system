import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { CLASS_MODEL_NAME } from './class.model';

export const STUDENT_MODEL_NAME = 'Student';

export const studentDTO = Yup.object({
  fullName: Yup.string().required(),
  noTlp: Yup.string().required(),
  parentName: Yup.string().required(),
  className: Yup.string().required(),
  gender: Yup.string().required(),
  tanggalLahir: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
});

export enum GenderStatus {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan',
}

export type TypeStudent = Yup.InferType<typeof studentDTO>;

export interface Student
  extends Omit<TypeStudent, 'parentName' | 'createdBy' | 'className'> {
  createdBy: ObjectId;
  parentName: String;
  className: ObjectId;
  picture: string;
  createdAt: string;
}

const Schema = mongoose.Schema;

const StudentSchema = new Schema<Student>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    picture: {
      type: Schema.Types.String,
      default: 'user.jpg',
    },
    noTlp: {
      type: Schema.Types.String,
      required: true,
    },
    parentName: {
      type: Schema.Types.String,
      required: true,
    },
    className: {
      type: Schema.Types.String,
      ref: CLASS_MODEL_NAME,
      required: true,
    },
    gender: {
      type: Schema.Types.String,
      enum: [GenderStatus.MALE, GenderStatus.FEMALE],
      required: true,
    },
    tanggalLahir: {
      type: Schema.Types.String,
      required: true,
    },
    location: {
      type: {
        region: {
          type: Schema.Types.Number,
        },
        address: {
          type: Schema.Types.String,
        },
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
).index({ fullName: 'text' });

const StudentModel = mongoose.model(STUDENT_MODEL_NAME, StudentSchema);

export default StudentModel;
