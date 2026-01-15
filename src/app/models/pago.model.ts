export interface Pago {
  id: number;
  pacienteId: number;
  pacienteNombre?: string;
  citaId?: number;
  consultaId?: number;
  planId?: number;
  sesionId?: number;
  tipo: TipoPago;
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string;
  concepto?: string;
  estado: EstadoPago;
  notas?: string;
  registradoPorId?: number;
  registradoPorNombre?: string;
  createdAt?: string;
}

export interface PagoRequest {
  pacienteId: number;
  citaId?: number;
  consultaId?: number;
  planId?: number;
  sesionId?: number;
  tipo: TipoPago;
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string;
  concepto?: string;
  notas?: string;
  registradoPorId: number;
}

export type TipoPago = 'ADELANTO_CITA' | 'ADELANTO_CONSULTA' | 'PAGO_CONSULTA' | 'ADELANTO_PLAN' | 'PAGO_PLAN_COMPLETO' | 'PAGO_SESION' | 'DEVOLUCION';
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'TARJETA';
export type EstadoPago = 'APLICADO' | 'PENDIENTE' | 'DEVUELTO';

export interface ResumenPagos {
  fecha?: string;
  fechaInicio?: string;
  fechaFin?: string;
  totalIngresos: number;
  cantidadPagos: number;
}