import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { LEARNING_MODEL_NAME } from './learning.model';
import { TEACHER_MODEL_NAME } from './teachers.model';

export const CLASS_MODEL_NAME = 'Class';

const Schema = mongoose.Schema;

export const classDTO = Yup.object({
  name: Yup.string().required(),
  slug: Yup.string(),
});

export type TypeClass = Yup.InferType<typeof classDTO>;

export interface Class
  extends Omit<TypeClass, 'classTeacher' | 'learning' | 'createdBy'> {
  classTeacher: ObjectId;
  learning: ObjectId;
  createdBy: ObjectId;
  createdAt: string;
}

const ClassSchema = new Schema<Class>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    classTeacher: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: TEACHER_MODEL_NAME,
    },
    learning: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: LEARNING_MODEL_NAME,
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
).index({ name: 'text' });

const ClassModel = mongoose.model(CLASS_MODEL_NAME, ClassSchema);

export default ClassModel;
