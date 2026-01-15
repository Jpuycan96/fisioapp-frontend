import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PlanTratamiento, PlanTratamientoRequest, EstadoPlan, ModalidadPago } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PlanTratamientoService {

  private endpoint = '/planes';

  constructor(private api: ApiService) {}

  getAll(): Observable<PlanTratamiento[]> {
    return this.api.get<PlanTratamiento[]>(this.endpoint);
  }

  getById(id: number): Observable<PlanTratamiento> {
    return this.api.get<PlanTratamiento>(`${this.endpoint}/${id}`);
  }

  getByPaciente(pacienteId: number): Observable<PlanTratamiento[]> {
    return this.api.get<PlanTratamiento[]>(`${this.endpoint}/paciente/${pacienteId}`);
  }

  getByEstado(estado: EstadoPlan): Observable<PlanTratamiento[]> {
    return this.api.get<PlanTratamiento[]>(`${this.endpoint}/estado/${estado}`);
  }

  create(plan: PlanTratamientoRequest): Observable<PlanTratamiento> {
    return this.api.post<PlanTratamiento>(this.endpoint, plan);
  }

  // PATCH /api/planes/{id}/confirmar?modalidadPago=X
  confirmar(id: number, modalidadPago: ModalidadPago, aplicarDescuento: boolean = true): Observable<PlanTratamiento> {
    return this.api.patch<PlanTratamiento>(
      `${this.endpoint}/${id}/confirmar?modalidadPago=${modalidadPago}&aplicarDescuento=${aplicarDescuento}`,
      {}
    );
  }

  // PATCH /api/planes/{id}/estado?estado=X
  updateEstado(id: number, estado: EstadoPlan): Observable<PlanTratamiento> {
    return this.api.patch<PlanTratamiento>(
      `${this.endpoint}/${id}/estado?estado=${estado}`,
      {}
    );
  }
}