import { UserRoleEnum } from '@meltstudio/types';
import { zodiosContext } from '@zodios/express';
import z from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: z.nativeEnum(UserRoleEnum).optional(),
});

export const ctx = zodiosContext(
  z.object({
    auth: z
      .object({
        user: userSchema,
      })
      .optional(),
  })
);
