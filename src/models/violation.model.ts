import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { TEACHER_MODEL_NAME } from './teachers.model';
import { USER_MODEL_NAME } from './user.model';

//Pelanggaran
export const VIOLATION_MODEL_NAME = 'Violation';

const Schema = mongoose.Schema;

export const violationDTO = Yup.object({
  violationName: Yup.string().required(),
  description: Yup.string().required(),
  point: Yup.string().required(),
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
    violationName: {
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
      ref: USER_MODEL_NAME,
    },
  },
  {
    timestamps: true,
  }
).index({ violationName: 'text' });

const ViolationModel = mongoose.model(VIOLATION_MODEL_NAME, ViolationSchema);

export default ViolationModel;
