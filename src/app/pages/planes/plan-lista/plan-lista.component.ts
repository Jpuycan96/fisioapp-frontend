import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlanTratamientoService } from '../../../services/plan-tratamiento.service';
import { PlanTratamiento, EstadoPlan } from '../../../models';

@Component({
  selector: 'app-plan-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './plan-lista.component.html',
  styleUrl: './plan-lista.component.scss'
})
export class PlanListaComponent implements OnInit {
  planes: PlanTratamiento[] = [];
  loading = true;
  estadoSeleccionado: EstadoPlan | null = null;

  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Propuesto', value: 'PROPUESTO' },
    { label: 'Aceptado', value: 'ACEPTADO' },
    { label: 'En Curso', value: 'EN_CURSO' },
    { label: 'Completado', value: 'COMPLETADO' },
    { label: 'Abandonado', value: 'ABANDONADO' }
  ];

  constructor(
    private planService: PlanTratamientoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPlanes();
  }

  loadPlanes(): void {
    this.loading = true;
    
    const request = this.estadoSeleccionado 
      ? this.planService.getByEstado(this.estadoSeleccionado)
      : this.planService.getAll();

    request.subscribe({
      next: (data) => {
        this.planes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando planes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los planes'
        });
        this.loading = false;
      }
    });
  }

  onEstadoChange(): void {
    this.loadPlanes();
  }

  getEstadoSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      'PROPUESTO': 'info',
      'ACEPTADO': 'success',
      'EN_CURSO': 'warn',
      'COMPLETADO': 'success',
      'ABANDONADO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PROPUESTO': 'Propuesto',
      'ACEPTADO': 'Aceptado',
      'EN_CURSO': 'En Curso',
      'COMPLETADO': 'Completado',
      'ABANDONADO': 'Abandonado'
    };
    return labels[estado] || estado;
  }

  getModalidadLabel(modalidad: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'PAGO_COMPLETO': 'Pago Completo',
      'PAGO_POR_SESION': 'Por Sesión'
    };
    return labels[modalidad] || modalidad;
  }

  getProgreso(plan: PlanTratamiento): number {
    if (!plan.sesionesCompletadas) return 0;
    return Math.round((plan.sesionesCompletadas / plan.numeroSesiones) * 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}