import { EstadoPaciente } from './paciente.model';

export interface Cita {
  id: number;
  fechaHora: string;
  tipo: TipoCita;
  estado: EstadoCita;
  numeroSesion?: number;
  notas?: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteTelefono: string;
  pacienteEstado: EstadoPaciente;
  planId?: number;
  planTotalSesiones?: number;
  atendidoPorId?: number;
  atendidoPorNombre?: string;
}

export interface CitaRequest {
  pacienteId: number;
  planId?: number;
  fechaHora: string;
  tipo: TipoCita;
  numeroSesion?: number;
  atendidoPorId?: number;
  notas?: string;
}

export interface CambiarEstadoCitaRequest {
  estado: EstadoCita;
  motivo?: string;
}

export type TipoCita = 'CONSULTA' | 'RECONSULTA' | 'SESION' | 'CONTROL';
export type EstadoCita = 'PROGRAMADA' | 'SEPARADA' | 'CONFIRMADA' | 'EN_ATENCION' | 'COMPLETADA' | 'REPROGRAMADA' | 'CANCELADA' | 'NO_ASISTIO';