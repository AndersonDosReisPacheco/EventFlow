import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

/**
 * Variáveis de ambiente obrigatórias
 */
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN as string;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as string;

if (
  !ACCESS_TOKEN_SECRET ||
  !REFRESH_TOKEN_SECRET ||
  !ACCESS_EXPIRES_IN ||
  !REFRESH_EXPIRES_IN
) {
  throw new Error("JWT environment variables are not properly defined");
}

/**
 * Gera access + refresh token
 */
export const generateTokens = (userId: string, email: string) => {
  const payload = { sub: userId, email };

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  } as SignOptions);

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  } as SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Valida access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

/**
 * Valida refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};
