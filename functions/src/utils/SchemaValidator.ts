import { z } from "zod";
import { AppError } from "../domain/AppError";

export class SchemaValidator {
  static parse<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new AppError("invalid-argument", "Dados invalidos", {
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }
    return result.data;
  }
}
