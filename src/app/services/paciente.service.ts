import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Paciente, PacienteRequest, EstadoPaciente } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiUrl = `${environment.apiUrl}/pacientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Paciente> {
    return this.http.get<ApiResponse<Paciente>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getByDni(dni: string): Observable<Paciente> {
    return this.http.get<ApiResponse<Paciente>>(`${this.apiUrl}/dni/${dni}`)
      .pipe(map(response => response.data));
  }

  buscar(termino: string): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(`${this.apiUrl}/buscar?q=${termino}`)
      .pipe(map(response => response.data));
  }

  getByEstado(estado: EstadoPaciente): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(`${this.apiUrl}/estado/${estado}`)
      .pipe(map(response => response.data));
  }

  getRequierenReconsulta(): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(`${this.apiUrl}/requieren-reconsulta`)
      .pipe(map(response => response.data));
  }

  create(paciente: PacienteRequest): Observable<Paciente> {
    return this.http.post<ApiResponse<Paciente>>(this.apiUrl, paciente)
      .pipe(map(response => response.data));
  }

  update(id: number, paciente: PacienteRequest): Observable<Paciente> {
    return this.http.put<ApiResponse<Paciente>>(`${this.apiUrl}/${id}`, paciente)
      .pipe(map(response => response.data));
  }

  updateEstado(id: number, estado: EstadoPaciente): Observable<Paciente> {
    return this.http.patch<ApiResponse<Paciente>>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {})
      .pipe(map(response => response.data));
  }
}