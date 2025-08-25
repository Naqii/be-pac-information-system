import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { TEACHER_MODEL_NAME } from './teachers.model';

export const CLASS_MODEL_NAME = 'Class';

const Schema = mongoose.Schema;

export const classDTO = Yup.object({
  className: Yup.string().required(),
  slug: Yup.string(),
});

export type TypeClass = Yup.InferType<typeof classDTO>;

export interface Class
  extends Omit<TypeClass, 'classTeacher' | 'learning' | 'createdBy'> {
  classTeacher: ObjectId;
  createdBy: ObjectId;
  createdAt?: string;
}

const ClassSchema = new Schema<Class>(
  {
    className: {
      type: Schema.Types.String,
      required: true,
    },
    classTeacher: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: TEACHER_MODEL_NAME,
    },
    slug: {
      type: Schema.Types.String,
      unique: true,
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
).index({ className: 'text' });

const ClassModel = mongoose.model(CLASS_MODEL_NAME, ClassSchema);

export default ClassModel;
