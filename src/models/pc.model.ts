import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { USER_MODEL_NAME } from './user.model';

export const PC_MODEL_NAME = 'PC';

const Schema = mongoose.Schema;

export const pcDTO = Yup.object({
  pcName: Yup.string().required(),
  slug: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
});

export const pcItemDTO = Yup.object({
  pacId: Yup.string().required(),
});

export type TypePC = Yup.InferType<typeof pcDTO>;

export type TypeItemPAC = {
  pacId: string;
};

export interface PC extends Omit<TypePC, 'createdBy'> {
  createdBy: ObjectId;
  createdAt: string;
  pacList: TypeItemPAC[];
}

const pcSchema = new Schema<PC>(
  {
    pcName: {
      type: Schema.Types.String,
      required: true,
    },
    slug: {
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
    pacList: {
      type: [
        {
          pacId: {
            type: Schema.Types.String,
            require: true,
          },
        },
      ],
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
).index({ pcName: 'text' });

const pcModel = mongoose.model(PC_MODEL_NAME, pcSchema);

export default pcModel;
