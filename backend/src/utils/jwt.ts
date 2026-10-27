import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  id: string;
  role: 'admin' | 'user';
  email: string;
  name: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};
