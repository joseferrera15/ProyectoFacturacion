import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
}).strict();

export const validateLogin = (credentials) => {
    return loginSchema.safeParse(credentials)
}