import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Consulta, ConsultaRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  private apiUrl = `${environment.apiUrl}/consultas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Consulta[]> {
    return this.http.get<ApiResponse<Consulta[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getById(id: number): Observable<Consulta> {
    return this.http.get<ApiResponse<Consulta>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  getByPaciente(pacienteId: number): Observable<Consulta[]> {
    return this.http.get<ApiResponse<Consulta[]>>(`${this.apiUrl}/paciente/${pacienteId}`)
      .pipe(map(response => response.data));
  }

  getByFecha(fecha: string): Observable<Consulta[]> {
    return this.http.get<ApiResponse<Consulta[]>>(`${this.apiUrl}/fecha/${fecha}`)
      .pipe(map(response => response.data));
  }

  create(consulta: ConsultaRequest): Observable<Consulta> {
    return this.http.post<ApiResponse<Consulta>>(this.apiUrl, consulta)
      .pipe(map(response => response.data));
  }

  update(id: number, consulta: ConsultaRequest): Observable<Consulta> {
    return this.http.put<ApiResponse<Consulta>>(`${this.apiUrl}/${id}`, consulta)
      .pipe(map(response => response.data));
  }
}