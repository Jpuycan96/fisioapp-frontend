import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Sesion, SesionRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  private endpoint = '/sesiones';

  constructor(private api: ApiService) {}

  getById(id: number): Observable<Sesion> {
    return this.api.get<Sesion>(`${this.endpoint}/${id}`);
  }

  getByPlan(planId: number): Observable<Sesion[]> {
    return this.api.get<Sesion[]>(`${this.endpoint}/plan/${planId}`);
  }

  create(sesion: SesionRequest): Observable<Sesion> {
    return this.api.post<Sesion>(this.endpoint, sesion);
  }

  update(id: number, sesion: SesionRequest): Observable<Sesion> {
    return this.api.put<Sesion>(`${this.endpoint}/${id}`, sesion);
  }
}
