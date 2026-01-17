import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN!;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN!;

export const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign({ userId, email }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ userId, email }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
