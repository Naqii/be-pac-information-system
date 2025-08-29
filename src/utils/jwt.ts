import jwt from 'jsonwebtoken';
import { SECRET } from './env';
import { IUserToken } from './interface';

//generate token
export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, {
    expiresIn: '23h',
  });
  return token;
};
//ambil data dari IUserToken
export const getUserData = (token: string) => {
  const user = jwt.verify(token, SECRET) as IUserToken;
  return user;
};
