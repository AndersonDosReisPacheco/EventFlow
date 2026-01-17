import jwt from "jsonwebtoken";

// Garanta valores padrão seguros
const ACCESS_TOKEN_SECRET =
  process.env.JWT_SECRET ||
  "eventflow_secret_key_development_2024_change_in_production";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "eventflow_refresh_secret_key_development_2024_change_in_production";

export const generateTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign({ userId, email }, ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign({ userId, email }, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error("Refresh token inválido ou expirado");
  }
};
