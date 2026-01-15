import { Cita } from './cita.model';

export interface Dashboard {
  citasHoy: number;
  consultasHoy: number;
  sesionesHoy: number;
  proximasCitas: Cita[];
  pacientesRequierenReconsulta: number;
  planesPendientesConfirmacion: number;
  pagosPendientes: number;
  ingresosDia: number;
}