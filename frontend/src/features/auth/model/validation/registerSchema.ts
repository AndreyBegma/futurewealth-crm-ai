import * as yup from 'yup';

export const registerSchema = yup
  .object({
    name: yup
      .string()
      .required('Name is required')
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(20, 'Name must be less than 20 characters'),
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address')
      .trim()
      .lowercase(),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase and number',
      ),
    confirmPassword: yup
      .string()
      .required('Please confirm your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
  })
  .required();

export type RegisterFormData = yup.InferType<typeof registerSchema>;
