import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { TEACHER_MODEL_NAME } from './teachers.model';
import { USER_MODEL_NAME } from './user.model';

export const LEARNING_MODEL_NAME = 'Learning';

const Schema = mongoose.Schema;

export const learningDTO = Yup.object({
  learningName: Yup.string().required(),
  totalPage: Yup.number().required(),
  description: Yup.string().required(),
});

export type TypeLearning = Yup.InferType<typeof learningDTO>;

export interface Learning
  extends Omit<TypeLearning, 'createdBy' | 'teacherId'> {
  createdBy: ObjectId;
  createdAt?: string;
  teacherId: ObjectId;
}

const LearningSchema = new Schema<Learning>(
  {
    learningName: {
      type: Schema.Types.String,
      required: true,
    },
    totalPage: {
      type: Schema.Types.Number,
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: TEACHER_MODEL_NAME,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
  },
  {
    timestamps: true,
  }
).index({ learningName: 'text' });

const LearningModel = mongoose.model(LEARNING_MODEL_NAME, LearningSchema);

export default LearningModel;
