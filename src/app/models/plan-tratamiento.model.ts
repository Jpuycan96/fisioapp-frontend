import { Tecnica } from './tecnica.model';

export interface PlanTratamiento {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  consultaId: number;
  diagnostico: string;
  numeroSesiones: number;
  sesionesCompletadas: number;
  costoPorSesion: number;
  costoTotal: number;
  porcentajeDescuento: number;
  costoConDescuento: number;
  modalidadPago: ModalidadPago;
  estado: EstadoPlan;
  fechaConfirmacion?: string;
  observaciones?: string;
  frecuenciaSugerida?: string;
  createdAt: string;
  tecnicas: Tecnica[];
  totalPagado: number;
  saldoPendiente: number;
}

// Request para crear plan (coincide con PlanTratamientoRequest.java)
export interface PlanTratamientoRequest {
  pacienteId: number;
  consultaId: number;
  diagnostico: string;
  numeroSesiones: number;
  porcentajeDescuento?: number;
  observaciones?: string;
  frecuenciaSugerida?: string;
  tecnicaIds: number[];
}

export type ModalidadPago = 'PENDIENTE' | 'PAGO_COMPLETO' | 'PAGO_POR_SESION';
export type EstadoPlan = 'PROPUESTO' | 'ACEPTADO' | 'EN_CURSO' | 'COMPLETADO' | 'ABANDONADO';