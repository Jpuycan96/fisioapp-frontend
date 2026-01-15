import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Cita, CitaRequest, CambiarEstadoCitaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Cita> {
    return this.http.get<ApiResponse<Cita>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getByPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.apiUrl}/paciente/${pacienteId}`)
      .pipe(map(response => response.data));
  }

  getCitasDelDia(fecha: string): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.apiUrl}/dia/${fecha}`)
      .pipe(map(response => response.data));
  }

  getCitasHoy(): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.apiUrl}/hoy`)
      .pipe(map(response => response.data));
  }

  getCitasSemana(inicio: string, fin: string): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.apiUrl}/semana?inicio=${inicio}&fin=${fin}`)
      .pipe(map(response => response.data));
  }

  create(cita: CitaRequest): Observable<Cita> {
    return this.http.post<ApiResponse<Cita>>(this.apiUrl, cita)
      .pipe(map(response => response.data));
  }

  cambiarEstado(id: number, request: CambiarEstadoCitaRequest): Observable<Cita> {
    return this.http.patch<ApiResponse<Cita>>(`${this.apiUrl}/${id}/estado`, request)
      .pipe(map(response => response.data));
  }

  reprogramar(id: number, nuevaFecha: string, motivo?: string): Observable<Cita> {
    let url = `${this.apiUrl}/${id}/reprogramar?nuevaFecha=${nuevaFecha}`;
    if (motivo) url += `&motivo=${motivo}`;
    return this.http.post<ApiResponse<Cita>>(url, {})
      .pipe(map(response => response.data));
  }
}