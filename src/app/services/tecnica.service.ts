import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tecnica, TecnicaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TecnicaService {

  private endpoint = '/tecnicas';

  constructor(private api: ApiService) {}

  getAll(): Observable<Tecnica[]> {
    return this.api.get<Tecnica[]>(this.endpoint);
  }

  getActivas(): Observable<Tecnica[]> {
    return this.api.get<Tecnica[]>(`${this.endpoint}/activas`);
  }

  getTodas(): Observable<Tecnica[]> {
    return this.api.get<Tecnica[]>(`${this.endpoint}/todas`);
  }

  getById(id: number): Observable<Tecnica> {
    return this.api.get<Tecnica>(`${this.endpoint}/${id}`);
  }

  create(tecnica: TecnicaRequest): Observable<Tecnica> {
    return this.api.post<Tecnica>(this.endpoint, tecnica);
  }

  update(id: number, tecnica: TecnicaRequest): Observable<Tecnica> {
    return this.api.put<Tecnica>(`${this.endpoint}/${id}`, tecnica);
  }

  activate(id: number): Observable<void> {
    return this.api.patch<void>(`${this.endpoint}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.api.patch<void>(`${this.endpoint}/${id}/deactivate`, {});
  }
}