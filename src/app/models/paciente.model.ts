export interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento?: string;
  edad?: number;
  sexo?: SexoTipo;
  telefono: string;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  fotoUrl?: string;
  alergias?: string;
  medicamentos?: string;
  condicionesPreexistentes?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaParentesco?: string;
  estado: EstadoPaciente;
  ultimaVisita?: string;
  createdAt: string;
}

export interface PacienteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  fechaNacimiento?: string;
  sexo?: SexoTipo;
  email?: string;
  direccion?: string;
  ocupacion?: string;
  fotoUrl?: string;
  alergias?: string;
  medicamentos?: string;
  condicionesPreexistentes?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaParentesco?: string;
}

export type SexoTipo = 'M' | 'F';
export type EstadoPaciente = 'NUEVO' | 'EN_TRATAMIENTO' | 'REQUIERE_RECONSULTA' | 'INACTIVO' | 'ALTA';