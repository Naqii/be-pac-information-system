import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { USER_MODEL_NAME } from './user.model';

export const PARENT_MODEL_NAME = 'Parent';

export const parentDTO = Yup.object({
  parentName: Yup.string().required(),
  noTlp: Yup.string().required(),
  gender: Yup.string().required(),
  poss: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
});

export enum GenderStatus {
  MALE = 'Bapak',
  FEMALE = 'Ibu',
}

export type TypeParent = Yup.InferType<typeof parentDTO>;

export interface Parent extends Omit<TypeParent, 'createdBy'> {
  createdBy: ObjectId;
  createdAt: string;
}

const Schema = mongoose.Schema;

const ParentSchema = new Schema<Parent>(
  {
    parentName: {
      type: Schema.Types.String,
      required: true,
    },
    noTlp: {
      type: Schema.Types.String,
      required: true,
    },
    gender: {
      type: Schema.Types.String,
      enum: [GenderStatus.MALE, GenderStatus.FEMALE],
      required: true,
    },
    poss: {
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
      ref: USER_MODEL_NAME,
    },
  },
  {
    timestamps: true,
  }
).index({ parentName: 'text' });

const ParentModel = mongoose.model(PARENT_MODEL_NAME, ParentSchema);

export default ParentModel;
