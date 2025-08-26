import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { PARENT_MODEL_NAME } from './parent.model';
import { CLASS_MODEL_NAME } from './class.model';

export const STUDENT_MODEL_NAME = 'Student';

export const studentDTO = Yup.object({
  fullName: Yup.string().required(),
  noTlp: Yup.string().required(),
  parentName: Yup.string().required(),
  className: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
  startDate: Yup.string().required(),
  endDate: Yup.string(),
});

export type TypeStudent = Yup.InferType<typeof studentDTO>;

export interface Student
  extends Omit<TypeStudent, 'parentName' | 'createdBy' | 'className'> {
  createdBy: ObjectId;
  parentName: String;
  className: String;
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
    startDate: {
      type: Schema.Types.String,
      required: true,
    },
    endDate: {
      type: Schema.Types.String,
      default: '-',
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
