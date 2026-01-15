import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, TipoHallazgo, ZonaCorporal } from '../models';

export interface Configuracion {
  id: number;
  clave: string;
  valor: string;
  tipo: string;
  descripcion?: string;
}

export interface PreciosConsulta {
  normal: number;
  referido: number;
  descuentoPagoCompleto: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Tipos de Hallazgo
  getTiposHallazgo(): Observable<TipoHallazgo[]> {
    return this.http.get<ApiResponse<TipoHallazgo[]>>(`${this.apiUrl}/tipos-hallazgo`)
      .pipe(map(response => response.data));
  }

  // Zonas Corporales
  getZonasCorporales(): Observable<ZonaCorporal[]> {
    return this.http.get<ApiResponse<ZonaCorporal[]>>(`${this.apiUrl}/zonas-corporales`)
      .pipe(map(response => response.data));
  }

  getZonasByRegion(region: string): Observable<ZonaCorporal[]> {
    return this.http.get<ApiResponse<ZonaCorporal[]>>(`${this.apiUrl}/zonas-corporales/region/${region}`)
      .pipe(map(response => response.data));
  }

  // Configuración general
  getAll(): Observable<Configuracion[]> {
    return this.http.get<ApiResponse<Configuracion[]>>(`${this.apiUrl}/configuracion`)
      .pipe(map(response => response.data));
  }

  getByKey(clave: string): Observable<Configuracion> {
    return this.http.get<ApiResponse<Configuracion>>(`${this.apiUrl}/configuracion/${clave}`)
      .pipe(map(response => response.data));
  }

  // Obtener precios de consulta
  getPreciosConsulta(): Observable<PreciosConsulta> {
    return forkJoin({
      normal: this.getByKey('precio_consulta_normal'),
      referido: this.getByKey('precio_consulta_recomendado'),
      descuento: this.getByKey('descuento_pago_completo')
    }).pipe(
      map(result => ({
        normal: parseFloat(result.normal.valor),
        referido: parseFloat(result.referido.valor),
        descuentoPagoCompleto: parseFloat(result.descuento.valor)
      }))
    );
  }
}