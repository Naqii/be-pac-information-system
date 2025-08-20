import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { TEACHER_MODEL_NAME } from './teachers.model';

export const LEARNING_MODEL_NAME = 'Learning';

const Schema = mongoose.Schema;

export const learningDTO = Yup.object({
  name: Yup.string().required(),
  teacher: Yup.string().required(),
  description: Yup.string().required(),
  createdBy: Yup.string().required(),
});

export type TypeLearning = Yup.InferType<typeof learningDTO>;

export interface Learning extends Omit<TypeLearning, 'createdBy' | 'teacher'> {
  createdBy: ObjectId;
  createdAt: string;
  teacher: ObjectId;
}

const LearningSchema = new Schema<Learning>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: TEACHER_MODEL_NAME,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.String,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
).index({ name: 'text' });

const LearningModel = mongoose.model(LEARNING_MODEL_NAME, LearningSchema);

export default LearningModel;
