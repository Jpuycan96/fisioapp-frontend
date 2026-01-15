import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CitaFormComponent } from '../cita-form/cita-form.component';
import { CitaService } from '../../../services/cita.service';
import { Cita, EstadoCita } from '../../../models';

@Component({
  selector: 'app-cita-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DatePickerModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    PageHeaderComponent,
    CitaFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cita-lista.component.html',
  styleUrl: './cita-lista.component.scss'
})
export class CitaListaComponent implements OnInit {
  citas: Cita[] = [];
  loading = true;
  
  // Filtros
  fechaSeleccionada: Date = new Date();
  estadoSeleccionado: EstadoCita | null = null;
  
  // Dialog
  showDialog = false;
  citaEditar: Cita | null = null;

  // Para citas desde plan
  pacienteIdParaCita: number | null = null;
  planIdParaCita: number | null = null;

  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Programada', value: 'PROGRAMADA' },
    { label: 'Confirmada', value: 'CONFIRMADA' },
    { label: 'En Atención', value: 'EN_ATENCION' },
    { label: 'Completada', value: 'COMPLETADA' },
    { label: 'Cancelada', value: 'CANCELADA' },
    { label: 'No Asistió', value: 'NO_ASISTIO' }
  ];

  estadoAcciones: Record<string, { label: string; icon: string; estado: EstadoCita }[]> = {
    'PROGRAMADA': [
      { label: 'Confirmar', icon: 'pi pi-check', estado: 'CONFIRMADA' },
      { label: 'Cancelar', icon: 'pi pi-times', estado: 'CANCELADA' }
    ],
    'CONFIRMADA': [
      { label: 'Iniciar Atención', icon: 'pi pi-play', estado: 'EN_ATENCION' },
      { label: 'No Asistió', icon: 'pi pi-user-minus', estado: 'NO_ASISTIO' },
      { label: 'Cancelar', icon: 'pi pi-times', estado: 'CANCELADA' }
    ],
    'EN_ATENCION': [
      { label: 'Completar', icon: 'pi pi-check-circle', estado: 'COMPLETADA' }
    ]
  };

  constructor(
    private citaService: CitaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si viene con queryParams para abrir el diálogo
    this.route.queryParams.subscribe(params => {
      if (params['pacienteId'] && params['planId']) {
        this.pacienteIdParaCita = +params['pacienteId'];
        this.planIdParaCita = +params['planId'];
        // Abrir el diálogo automáticamente
        setTimeout(() => {
          this.showDialog = true;
        }, 500);
      }
    });

    this.loadCitas();
  }

  loadCitas(): void {
    this.loading = true;
    const fecha = this.formatDate(this.fechaSeleccionada);
    
    this.citaService.getCitasDelDia(fecha).subscribe({
      next: (data) => {
        this.citas = this.estadoSeleccionado 
          ? data.filter(c => c.estado === this.estadoSeleccionado)
          : data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las citas'
        });
        this.loading = false;
      }
    });
  }

  onFechaChange(): void {
    this.loadCitas();
  }

  onEstadoChange(): void {
    this.loadCitas();
  }

  verHoy(): void {
    this.fechaSeleccionada = new Date();
    this.loadCitas();
  }

  verManana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaSeleccionada = manana;
    this.loadCitas();
  }

  nuevaCita(): void {
    // Resetear los IDs cuando es una nueva cita normal
    this.pacienteIdParaCita = null;
    this.planIdParaCita = null;
    this.citaEditar = null;
    this.showDialog = true;
  }

  onCitaGuardada(): void {
    this.showDialog = false;
    // Limpiar queryParams después de guardar
    this.pacienteIdParaCita = null;
    this.planIdParaCita = null;
    // Limpiar la URL de queryParams
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.loadCitas();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cita guardada correctamente'
    });
  }

  onDialogHide(): void {
    // Limpiar cuando se cierra el diálogo
    this.pacienteIdParaCita = null;
    this.planIdParaCita = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  irAConsulta(cita: Cita): void {
    this.router.navigate(['/consultas/nueva'], {
      queryParams: { pacienteId: cita.pacienteId, citaId: cita.id }
    });
  }

  irACrearPlan(cita: Cita): void {
    // Navegar a consultas para que seleccione la consulta desde donde crear el plan
    this.router.navigate(['/consultas']);
    this.messageService.add({
      severity: 'info',
      summary: 'Crear Plan',
      detail: 'Seleccione la consulta desde la cual desea crear el plan'
    });
  }

  irARegistrarSesion(cita: Cita): void {
    this.router.navigate(['/sesiones/nueva'], {
      queryParams: { 
        citaId: cita.id,
        pacienteId: cita.pacienteId, 
        planId: cita.planId,
        numeroSesion: cita.numeroSesion
      }
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: EstadoCita): void {
    const mensajes: Record<string, string> = {
      'CONFIRMADA': '¿Confirmar esta cita?',
      'EN_ATENCION': '¿Iniciar atención de esta cita?',
      'COMPLETADA': '¿Marcar esta cita como completada?',
      'CANCELADA': '¿Cancelar esta cita?',
      'NO_ASISTIO': '¿Marcar que el paciente no asistió?'
    };

    this.confirmationService.confirm({
      message: mensajes[nuevoEstado] || '¿Cambiar estado de la cita?',
      header: 'Confirmar',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.citaService.cambiarEstado(cita.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Estado actualizado correctamente'
            });
            this.loadCitas();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'No se pudo actualizar el estado'
            });
          }
        });
      }
    });
  }

  getAccionesDisponibles(cita: Cita): { label: string; icon: string; estado: EstadoCita }[] {
    return this.estadoAcciones[cita.estado] || [];
  }

  getEstadoSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger"> = {
      'PROGRAMADA': 'info',
      'SEPARADA': 'secondary',
      'CONFIRMADA': 'success',
      'EN_ATENCION': 'warn',
      'COMPLETADA': 'success',
      'REPROGRAMADA': 'info',
      'CANCELADA': 'danger',
      'NO_ASISTIO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PROGRAMADA': 'Programada',
      'SEPARADA': 'Separada',
      'CONFIRMADA': 'Confirmada',
      'EN_ATENCION': 'En Atención',
      'COMPLETADA': 'Completada',
      'REPROGRAMADA': 'Reprogramada',
      'CANCELADA': 'Cancelada',
      'NO_ASISTIO': 'No Asistió'
    };
    return labels[estado] || estado;
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'CONSULTA': 'Consulta',
      'RECONSULTA': 'Reconsulta',
      'SESION': 'Sesión',
      'CONTROL': 'Control'
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: string): string {
    const classes: Record<string, string> = {
      'CONSULTA': 'tipo-consulta',
      'RECONSULTA': 'tipo-reconsulta',
      'SESION': 'tipo-sesion',
      'CONTROL': 'tipo-control'
    };
    return classes[tipo] || '';
  }

  formatHora(fechaHora: string): string {
    return new Date(fechaHora).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatFechaDisplay(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}