import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';
import { USER_MODEL_NAME } from './user.model';

export const TEACHER_MODEL_NAME = 'Teacher';

const Schema = mongoose.Schema;

export const teacherDTO = Yup.object({
  teacherName: Yup.string().required(),
  startDate: Yup.string().required(),
  endDate: Yup.string(),
  noTelp: Yup.string().required(),
  gender: Yup.string().required(),
  bidang: Yup.string().required(),
  pendidikan: Yup.string().required(),
  slug: Yup.string(),
});

export enum GenderStatus {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan',
}

export type TypeTeacher = Yup.InferType<typeof teacherDTO>;

export interface Teacher extends Omit<TypeTeacher, 'createdBy'> {
  createdBy: ObjectId;
  picture: string;
  createdAt?: string;
}

const TeacherSchema = new Schema<Teacher>(
  {
    teacherName: {
      type: Schema.Types.String,
      required: true,
    },
    picture: {
      type: Schema.Types.String,
      default: 'user.jpg',
    },
    startDate: {
      type: Schema.Types.String,
      required: true,
    },
    endDate: {
      type: Schema.Types.String,
      default: '-',
    },
    noTelp: {
      type: Schema.Types.String,
      required: true,
    },
    gender: {
      type: Schema.Types.String,
      enum: [GenderStatus.MALE, GenderStatus.FEMALE],
      required: true,
    },
    bidang: {
      type: Schema.Types.String,
      required: true,
    },
    pendidikan: {
      type: Schema.Types.String,
      required: true,
    },
    slug: {
      type: Schema.Types.String,
      unique: true,
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
).index({ teacherName: 'text' });

TeacherSchema.pre('save', function () {
  if (!this.slug) {
    const slug = this.teacherName.split(' ').join('-').toLowerCase();
    this.slug = `${slug}`;
  }
});

const TeacherModel = mongoose.model(TEACHER_MODEL_NAME, TeacherSchema);

export default TeacherModel;
