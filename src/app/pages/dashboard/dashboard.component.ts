import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DashboardService } from '../../services/dashboard.service';
import { Dashboard, Cita } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.loading = false;
      }
    });
  }

  getEstadoCitaSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger" | "contrast"> = {
      'PROGRAMADA': 'info',
      'CONFIRMADA': 'success',
      'EN_ATENCION': 'warn',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger',
      'NO_ASISTIO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  getTipoCitaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'CONSULTA': 'Consulta',
      'RECONSULTA': 'Reconsulta',
      'SESION': 'Sesión',
      'CONTROL': 'Control'
    };
    return labels[tipo] || tipo;
  }

  formatHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}