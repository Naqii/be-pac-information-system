import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';

export const CLASS_MODEL_NAME = 'Class';

const Schema = mongoose.Schema;

export const classDTO = Yup.object({
  name: Yup.string().required(),
  teacherBy: Yup.string().required(),
  learning: Yup.string().required(),
  createdBy: Yup.string().required(),
  slug: Yup.string(),
  createdAt: Yup.string(),
  updateAt: Yup.string(),
});

export type TypeClass = Yup.InferType<typeof classDTO>;

export interface Class
  extends Omit<TypeClass, 'teacherBy' | 'learning' | 'createdBy'> {
  teacherBy: ObjectId;
  learning: ObjectId;
  createdBy: ObjectId;
}

const ClassSchema = new Schema<Class>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    teacherBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Teacher',
    },
    learning: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Learning',
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
