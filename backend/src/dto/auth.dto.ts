export interface RegisterDto {
  name?: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
