import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {Pago, PagoRequest, ResumenPagos} from '../models/pago.model';


@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private endpoint = '/pagos';

  constructor(private api: ApiService) {}

  getAll(): Observable<Pago[]> {
    return this.api.get<Pago[]>(this.endpoint);
  }

  getById(id: number): Observable<Pago> {
    return this.api.get<Pago>(`${this.endpoint}/${id}`);
  }

  getByPaciente(pacienteId: number): Observable<Pago[]> {
    return this.api.get<Pago[]>(`${this.endpoint}/paciente/${pacienteId}`);
  }

  getByPlan(planId: number): Observable<Pago[]> {
    return this.api.get<Pago[]>(`${this.endpoint}/plan/${planId}`);
  }

  getByFecha(fecha: string): Observable<Pago[]> {
    return this.api.get<Pago[]>(`${this.endpoint}/fecha/${fecha}`);
  }

  getByRango(inicio: string, fin: string): Observable<Pago[]> {
    return this.api.get<Pago[]>(`${this.endpoint}/rango?inicio=${inicio}&fin=${fin}`);
  }

  getResumenDia(fecha: string): Observable<ResumenPagos> {
    return this.api.get<ResumenPagos>(`${this.endpoint}/resumen/dia/${fecha}`);
  }

  getResumenRango(inicio: string, fin: string): Observable<ResumenPagos> {
    return this.api.get<ResumenPagos>(`${this.endpoint}/resumen/rango?inicio=${inicio}&fin=${fin}`);
  }

  getTotalByPlan(planId: number): Observable<{ totalPagado: number }> {
    return this.api.get<{ totalPagado: number }>(`${this.endpoint}/plan/${planId}/total`);
  }

  create(pago: PagoRequest): Observable<Pago> {
    return this.api.post<Pago>(this.endpoint, pago);
  }

  marcarDevuelto(id: number): Observable<Pago> {
    return this.api.patch<Pago>(`${this.endpoint}/${id}/devolver`, {});
  }
}