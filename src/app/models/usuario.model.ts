export interface Usuario {
  id: number;
  username: string;
  email?: string;
  nombre: string;
  rol: RolUsuario;
  activo: boolean;
  ultimoAcceso?: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  nombre: string;
  email?: string;
  rol: RolUsuario;
  token: string;
}

export type RolUsuario = 'ADMIN' | 'FISIOTERAPEUTA';