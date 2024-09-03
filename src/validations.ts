import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.string().min(3),
  DATABASE_URL: z.string().min(3),
});

export type Env = z.infer<typeof envSchema>;
export const validateEnv = (env: any): Env => {
  return envSchema.parse(env);
};

export const validatedEnv = validateEnv(process.env);
// console.log(validatedEnv);
