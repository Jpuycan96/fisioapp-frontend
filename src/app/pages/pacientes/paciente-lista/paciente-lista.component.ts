import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente, EstadoPaciente } from '../../../models';

@Component({
  selector: 'app-paciente-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './paciente-lista.component.html',
  styleUrl: './paciente-lista.component.scss'
})
export class PacienteListaComponent implements OnInit {
  pacientes: Paciente[] = [];
  loading = true;
  searchTerm = '';

  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Nuevo', value: 'NUEVO' },
    { label: 'En Tratamiento', value: 'EN_TRATAMIENTO' },
    { label: 'Requiere Reconsulta', value: 'REQUIERE_RECONSULTA' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Alta', value: 'ALTA' }
  ];
  selectedEstado: EstadoPaciente | null = null;

  constructor(
    private pacienteService: PacienteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  loadPacientes(): void {
    this.loading = true;
    this.pacienteService.getAll().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando pacientes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pacientes'
        });
        this.loading = false;
      }
    });
  }

  buscar(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.pacienteService.buscar(this.searchTerm).subscribe({
        next: (data) => {
          this.pacientes = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loadPacientes();
    }
  }

  filterByEstado(): void {
    if (this.selectedEstado) {
      this.loading = true;
      this.pacienteService.getByEstado(this.selectedEstado).subscribe({
        next: (data) => {
          this.pacientes = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loadPacientes();
    }
  }

  getEstadoSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
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

  confirmDelete(paciente: Paciente): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a ${paciente.nombreCompleto}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        // Aquí iría la lógica de eliminación
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Paciente eliminado correctamente'
        });
      }
    });
  }
}