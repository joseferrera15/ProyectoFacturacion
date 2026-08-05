import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo electrónico inválida' }),
  password: z.string().min(6, { message: 'Contraseña debe tener al menos 6 caracteres' }),
}).strict();

export const validateLogin = (credentials) => {
    return loginSchema.safeParse(credentials)
}