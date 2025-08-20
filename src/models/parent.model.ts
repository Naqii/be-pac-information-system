import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';

export const PARENT_MODEL_NAME = 'Parent';

export const parentDTO = Yup.object({
  name: Yup.string().required(),
  noTlp: Yup.string().required(),
  poss: Yup.string().required(),
  createdBy: Yup.string().required(),
  location: Yup.object()
    .shape({
      region: Yup.number(),
      address: Yup.string(),
    })
    .required(),
});

export type TypeParent = Yup.InferType<typeof parentDTO>;

export interface Parent extends Omit<TypeParent, 'createdBy'> {
  createdBy: ObjectId;
  createdAt: string;
}

const Schema = mongoose.Schema;

const ParentSchema = new Schema<Parent>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    noTlp: {
      type: Schema.Types.String,
      required: true,
    },
    poss: {
      type: Schema.Types.String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
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
  },
  {
    timestamps: true,
  }
).index({ name: 'text' });

const ParentModel = mongoose.model(PARENT_MODEL_NAME, ParentSchema);

export default ParentModel;
