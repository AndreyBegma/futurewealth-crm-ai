import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address')
    .trim()
    .lowercase(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
