import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { USER_MODEL_NAME } from './user.model';

export const PAC_MODEL_NAME = 'PAC';

const Schema = mongoose.Schema;

export const pacDTO = Yup.object({
  pacName: Yup.string().required(),
  slug: Yup.string().required(),
  location: Yup.object()
    .shape({
      village: Yup.number(),
      address: Yup.string(),
    })
    .required(),
});

export type TypePAC = Yup.InferType<typeof pacDTO>;

export interface PAC extends Omit<TypePAC, 'createdBy'> {
  createdBy: ObjectId;
  createdAt: string;
}

const pacSchema = new Schema<PAC>(
  {
    pacName: {
      type: Schema.Types.String,
      required: true,
    },
    slug: {
      type: Schema.Types.String,
      required: true,
    },
    location: {
      type: {
        village: {
          type: Schema.Types.Number,
        },
        address: {
          type: Schema.Types.String,
        },
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
  },
  {
    timestamps: true,
  }
).index({ pacName: 'text' });

const pacModel = mongoose.model(PAC_MODEL_NAME, pacSchema);

export default pacModel;
