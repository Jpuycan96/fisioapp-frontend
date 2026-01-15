export interface Sesion {
  id: number;
  planId: number;
  numeroSesion: number;
  fecha: string;
  escalaEva?: number;
  pesoKg?: number;
  tallaCm?: number;
  observaciones?: string;
  atendidoPorId?: number;
  atendidoPorNombre?: string;
  tecnicasAplicadas?: SesionTecnica[];
  createdAt?: string;
}

export interface SesionTecnica {
  id: number;
  tecnicaId: number;
  tecnicaNombre?: string;
  observaciones?: string;
}

export interface SesionRequest {
  planId: number;
  numeroSesion?: number;
  fecha: string;
  escalaEva?: number;
  pesoKg?: number;
  tallaCm?: number;
  observaciones?: string;
  atendidoPorId: number;
  tecnicaIds?: number[];
}