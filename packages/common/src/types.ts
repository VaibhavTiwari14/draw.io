import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z
    .string()
    .min(2, "Min length for username is 2")
    .max(10, "Max length for username is 10"),
  email: z.email("Email is required"),
  password: z
    .string()
    .min(4, "Min length for password is 4")
    .max(10, "Max length for password is 10"),
});

export const SignInSchema = z.object({
  email: z.email("Email is required"),
  password: z
    .string()
    .min(4, "Min length for password is 4")
    .max(10, "Max length for password is 10"),
});

export const CreateRoomSchema = z.object({
    roomName : z.string().min(3).max(20)
})

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof CreateUserSchema>;
 
