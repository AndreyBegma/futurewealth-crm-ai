import { AuthTokens, TokenPayload } from "@/types/auth.types";
import jwt from "jsonwebtoken";


export class TokenService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly ACCESS_TOKEN_EXPIRES_IN = "15m";
  private static readonly REFRESH_TOKEN_EXPIRES_IN = "7d";

  static generateTokens(payload: {
    userId: string;
    email: string;
    type: "access" | "refresh";
  }): AuthTokens {
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: "access",
      } as TokenPayload,
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: "refresh",
      } as TokenPayload,
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
  }
}
