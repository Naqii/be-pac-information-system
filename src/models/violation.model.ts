import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { TEACHER_MODEL_NAME } from './teachers.model';

//Pelanggaran
export const VIOLATION_MODEL_NAME = 'Violation';

const Schema = mongoose.Schema;

export const violationDTO = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  judgeBy: Yup.string().required(),
  point: Yup.string().required(),
  createdBy: Yup.string().required(),
  updateAt: Yup.string(),
});

export type TypeViolation = Yup.InferType<typeof violationDTO>;

export interface Violation
  extends Omit<TypeViolation, 'judgeBy' | 'createdBy'> {
  judgeBy: ObjectId;
  createdBy: ObjectId;
  createdAt: string;
}

const ViolationSchema = new Schema<Violation>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    judgeBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: TEACHER_MODEL_NAME,
    },
    point: {
      type: Schema.Types.String,
      required: true,
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

const ViolationModel = mongoose.model(VIOLATION_MODEL_NAME, ViolationSchema);

export default ViolationModel;
