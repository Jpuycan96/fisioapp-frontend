import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, Dashboard, Cita } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<ApiResponse<Dashboard>>(`${this.apiUrl}/dashboard`)
      .pipe(map(response => response.data));
  }

  getCitasHoy(): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.apiUrl}/dashboard/citas-hoy`)
      .pipe(map(response => response.data));
  }

  getAlertas(): Observable<{ pacientesRequierenReconsulta: number; planesPendientesConfirmacion: number }> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard/alertas`)
      .pipe(map(response => response.data));
  }
}