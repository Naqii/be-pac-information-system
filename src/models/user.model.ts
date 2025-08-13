import * as Yup from 'yup';
import mongoose from 'mongoose';
import { ROLES } from '../utils/constant';
import { encrypt } from '../utils/encryption';

const validatePassword = Yup.string()
  .required()
  .min(6, 'Password mus be at least 6 characters')
  .test(
    'at-least-one-uppercase-letter',
    'Contain at least one uppercase letter',
    (value) => {
      if (!value) return false;
      const regex = /^(?=.*[A-Z])/;
      return regex.test(value);
    }
  )
  .test('at-least-one-number', 'Contain at least one numbers', (value) => {
    if (!value) return false;
    const regex = /^(?=.*[\d])/;
    return regex.test(value);
  });

const validateConfirmPassword = Yup.string().oneOf(
  [Yup.ref('password'), ''],
  'Pasword not matched'
);

export const USER_MODEL_NAME = 'User';

export const userLoginDTO = Yup.object({
  identifier: Yup.string().required(),
  password: validatePassword,
});

export const userUpdatePasswordDTO = Yup.object({
  oldPassword: validatePassword,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export const userDTO = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export type TypeUser = Yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, 'confirmPassword'> {
  isActive: boolean;
  activationCode: string;
  role: string;
  profilePicture: string;
  cratedAt?: string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: [ROLES.ADMIN, ROLES.KK],
      default: ROLES.KK,
    },
    profilePicture: {
      type: Schema.Types.String,
      default: 'user.jpg',
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', function (next) {
  const user = this;
  user.password = encrypt(user.password);
  user.activationCode = encrypt(user.id);

  next();
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model(USER_MODEL_NAME, UserSchema);

export default UserModel;
