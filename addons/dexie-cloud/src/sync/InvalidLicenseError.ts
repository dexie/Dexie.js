import { UserLogin } from "../db/entities/UserLogin";

export class InvalidLicenseError extends Error {
  name = "InvalidLicenseError";
  constructor() {
    super(`Invalid license`);
  }
}