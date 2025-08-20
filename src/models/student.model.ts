import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { PARENT_MODEL_NAME } from './parent.model';
import { CLASS_MODEL_NAME } from './class.model';

export const STUDENT_MODEL_NAME = 'Student';

export const studentDTO = Yup.object({
  name: Yup.string().required(),
  noTlp: Yup.string().required(),
  parent: Yup.string().required(),
  class: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
  startDate: Yup.string().required(),
  endDate: Yup.string(),
  createdBy: Yup.string().required(),
});

export type TypeStudent = Yup.InferType<typeof studentDTO>;

export interface Student
  extends Omit<TypeStudent, 'parent' | 'createdBy' | 'class'> {
  createdBy: ObjectId;
  parent: ObjectId;
  class: ObjectId;
  picture: string;
  createdAt: string;
}

const Schema = mongoose.Schema;

const StudentSchema = new Schema<Student>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    picture: {
      type: Schema.Types.String,
      default: 'user.jpg',
    },
    noTlp: {
      type: Schema.Types.String,
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: PARENT_MODEL_NAME,
    },
    class: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: CLASS_MODEL_NAME,
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
).index({ name: 'text' });

const StudentModel = mongoose.model(STUDENT_MODEL_NAME, StudentSchema);

export default StudentModel;
