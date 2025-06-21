import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Generate access token
export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload = { id: userId };
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '1h') as jwt.SignOptions['expiresIn'],
    issuer: 'task-manager-api'
  };

  return jwt.sign(payload, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  const payload = { id: userId };
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as jwt.SignOptions['expiresIn'],
    issuer: 'task-manager-api'
  };

  return jwt.sign(payload, secret, options);
};

// Verify access token
export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
