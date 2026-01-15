export interface Tecnica {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TecnicaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos?: number;
}