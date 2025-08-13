import { Request, Response } from 'express';
import UserModel, { userDTO, userLoginDTO } from '../models/user.model';
import response from '../utils/response';
import { encrypt } from '../utils/encryption';
import { generateToken } from '../utils/jwt';
import { IReqUser } from '../utils/interface';

export default {
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } = req.body;

    try {
      await userDTO.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      response.success(res, result, 'success register user');
    } catch (error) {
      response.error(res, error, 'failed register user');
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      await userLoginDTO.validate({
        identifier,
        password,
      });

      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });

      if (!userByIdentifier) {
        return response.unauthorized(res, 'user not found');
      }

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthorized(res, 'wrong password');
      }

      const token = generateToken({
        id: userByIdentifier.id,
        role: userByIdentifier.role,
      });

      response.success(res, token, 'success login user');
    } catch (error) {
      response.error(res, error, 'failed login user');
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, 'success get user data');
    } catch (error) {
      response.error(res, error, 'failed get user data');
    }
  },

  async activation(req: Request, res: Response) {
    try {
      const { code } = req.body as { code: string };
      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );
      response.success(res, user, 'success activation user');
    } catch (error) {
      response.error(res, error, 'failed activation user');
    }
  },
};
