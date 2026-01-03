import { CustomPayload } from "./modules/auth/types/auth.document";

export {};
declare global {
  namespace Express {
    interface Request {
      user: CustomPayload;
    }
  }
  namespace NodeJs {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "testing";
      PORT: number;
      DATABASE_URL: string;
      COOKIE_SECRET_KEY: string;
      COOKIE_REFRESH_SECRET: string;
      REDIS_URL: string;
      CLIENT: string;
    }
  }
}
