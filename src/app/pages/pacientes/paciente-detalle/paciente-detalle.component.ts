import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PacienteService } from '../../../services/paciente.service';
import { CitaService } from '../../../services/cita.service';
import { Paciente, Cita } from '../../../models';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TabViewModule,
    TagModule,
    TableModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './paciente-detalle.component.html',
  styleUrl: './paciente-detalle.component.scss'
})
export class PacienteDetalleComponent implements OnInit {
  paciente: Paciente | null = null;
  citas: Cita[] = [];
  loading = true;
  loadingCitas = false;

  constructor(
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaciente(+id);
    }
  }

  loadPaciente(id: number): void {
    this.loading = true;
    this.pacienteService.getById(id).subscribe({
      next: (data) => {
        this.paciente = data;
        this.loading = false;
        this.loadCitas(id);
      },
      error: (err) => {
        console.error('Error cargando paciente', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Paciente no encontrado'
        });
        this.loading = false;
        this.router.navigate(['/pacientes']);
      }
    });
  }

  loadCitas(pacienteId: number): void {
    this.loadingCitas = true;
    this.citaService.getByPaciente(pacienteId).subscribe({
      next: (data) => {
        this.citas = data;
        this.loadingCitas = false;
      },
      error: () => {
        this.loadingCitas = false;
      }
    });
  }

  getEstadoSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      'NUEVO': 'info',
      'EN_TRATAMIENTO': 'success',
      'REQUIERE_RECONSULTA': 'warn',
      'INACTIVO': 'secondary',
      'ALTA': 'success'
    };
    return severities[estado] || 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'NUEVO': 'Nuevo',
      'EN_TRATAMIENTO': 'En Tratamiento',
      'REQUIERE_RECONSULTA': 'Requiere Reconsulta',
      'INACTIVO': 'Inactivo',
      'ALTA': 'Alta'
    };
    return labels[estado] || estado;
  }

  getEstadoCitaSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      'PROGRAMADA': 'info',
      'CONFIRMADA': 'success',
      'EN_ATENCION': 'warn',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger',
      'NO_ASISTIO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}