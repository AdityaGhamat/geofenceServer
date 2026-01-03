import jwt from "jsonwebtoken";
import { CustomPayload } from "../types/auth.document";

export function createSessionCookie(
  payload: Record<string, any>,
  secret: string,
  options: Record<string, string>
): String {
  const cookie = jwt.sign(payload, secret, options);
  return cookie;
}

export function decodeCookie(cookie: string, secret: string) {
  const decoded = jwt.verify(cookie, secret);
  return decoded as CustomPayload;
}
