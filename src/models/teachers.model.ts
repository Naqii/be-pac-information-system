import mongoose, { ObjectId } from 'mongoose';
import * as Yup from 'yup';

export const TEACHER_MODEL_NAME = 'Teacher';

const Schema = mongoose.Schema;

export const teacherDTO = Yup.object({
  name: Yup.string().required(),
  picture: Yup.string(),
  startDate: Yup.string().required(),
  endDate: Yup.string(),
  noTelp: Yup.string().required(),
  bidang: Yup.string().required(),
  pendidikan: Yup.string().required(),
  createdBy: Yup.string().required(),
  slug: Yup.string(),
  updatedAt: Yup.string(),
  createdAt: Yup.string(),
});

export type TypeTeacher = Yup.InferType<typeof teacherDTO>;

export interface Teacher extends Omit<TypeTeacher, 'createdBy'> {
  createdBy: ObjectId;
}

const TeacherSchema = new Schema<Teacher>(
  {
    name: {
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
    bidang: {
      type: Schema.Types.String,
      required: true,
    },
    pendidikan: {
      type: Schema.Types.String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    slug: {
      type: Schema.Types.String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
).index({ name: 'text' });

TeacherSchema.pre('save', function () {
  if (!this.slug) {
    const slug = this.name.split(' ').join('-').toLowerCase();
    this.slug = `${slug}`;
  }
});

const TeacherModel = mongoose.model(TEACHER_MODEL_NAME, TeacherSchema);

export default TeacherModel;
