import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { CitaService } from '../../../services/cita.service';
import { Cita } from '../../../models';

@Component({
  selector: 'app-cita-agenda',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    FullCalendarModule,
    ButtonModule,
    DialogModule,
    TagModule,
    ToastModule,
    TooltipModule,
    CalendarModule
  ],
  providers: [MessageService],
  templateUrl: './cita-agenda.component.html',
  styleUrl: './cita-agenda.component.scss'
})
export class CitaAgendaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  private resizeObserver!: ResizeObserver;

  citas: Cita[] = [];
  loading = true;
  fechaActual = new Date();
  fechaMiniCalendario: Date = new Date();
  
  mostrarDetalle = false;
  citaSeleccionada: Cita | null = null;

  citasDelDia: Cita[] = [];
  citasManana: Cita[] = [];
  diaSeleccionado = new Date();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    },
    allDaySlot: false,
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    nowIndicator: true,
    height: 'auto',
    eventClick: this.onEventClick.bind(this),
    dateClick: this.onDateClick.bind(this),
    datesSet: this.onDatesSet.bind(this),
    events: []
  };

  private coloresTipo: Record<string, { bg: string; border: string; text: string }> = {
    'CONSULTA': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    'RECONSULTA': { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
    'SESION': { bg: '#ccfbf1', border: '#14b8a6', text: '#115e59' },
    'CONTROL': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
  };

  private coloresEstado: Record<string, { bg: string; border: string }> = {
    'COMPLETADA': { bg: '#dcfce7', border: '#22c55e' },
    'CANCELADA': { bg: '#fee2e2', border: '#ef4444' },
    'NO_ASISTIO': { bg: '#fecaca', border: '#dc2626' }
  };

  constructor(
    private citaService: CitaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCitas();
    this.updateCitasDelDia();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCalendarSize();
    });
    
    if (this.calendarContainer?.nativeElement) {
      this.resizeObserver.observe(this.calendarContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateCalendarSize(): void {
    setTimeout(() => {
      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.updateSize();
      }
    }, 300);
  }

  loadCitas(): void {
    this.loading = true;
    this.citaService.getAll().subscribe({
      next: (citas) => {
        this.citas = citas;
        this.updateCalendarEvents();
        this.updateCitasDelDia();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando citas', err);
        this.loading = false;
      }
    });
  }

  updateCalendarEvents(): void {
    const eventos: EventInput[] = this.citas.map(cita => {
      const colores = this.getColoresCita(cita);
      
      return {
        id: cita.id.toString(),
        title: this.getEventTitle(cita),
        start: cita.fechaHora,
        end: this.calcularFin(cita.fechaHora),
        backgroundColor: colores.bg,
        borderColor: colores.border,
        textColor: colores.text,
        extendedProps: { cita }
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventos
    };
  }

  getColoresCita(cita: Cita): { bg: string; border: string; text: string } {
    if (['COMPLETADA', 'CANCELADA', 'NO_ASISTIO'].includes(cita.estado)) {
      const colorEstado = this.coloresEstado[cita.estado];
      return { ...colorEstado, text: '#374151' };
    }
    return this.coloresTipo[cita.tipo] || { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' };
  }

  getEventTitle(cita: Cita): string {
    const nombre = cita.pacienteNombre || 'Paciente';
    return nombre.split(' ')[0];
  }

  calcularFin(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    fecha.setMinutes(fecha.getMinutes() + 45);
    return fecha.toISOString();
  }

  onEventClick(clickInfo: EventClickArg): void {
    const cita = clickInfo.event.extendedProps['cita'] as Cita;
    if (cita) {
      this.citaSeleccionada = cita;
      this.mostrarDetalle = true;
    }
  }

  onDateClick(arg: { date: Date }): void {
    this.diaSeleccionado = arg.date;
    this.fechaMiniCalendario = arg.date;
    this.updateCitasDelDia();
  }

  onDatesSet(arg: { start: Date }): void {
    this.fechaActual = arg.start;
  }

  onMiniCalendarioSelect(event: Date): void {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.gotoDate(event);
    }
    this.diaSeleccionado = event;
    this.updateCitasDelDia();
  }

  updateCitasDelDia(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    this.citasDelDia = this.citas
      .filter(c => {
        const fecha = new Date(c.fechaHora);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

    this.citasManana = this.citas
      .filter(c => {
        const fecha = new Date(c.fechaHora);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === manana.getTime();
      })
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  irHoy(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.today();
  }

  irAnterior(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();
  }

  irSiguiente(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.next();
  }

  cambiarVista(vista: string): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.changeView(vista);
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

  getTipoSeverity(tipo: string): "success" | "info" | "warn" | "danger" | "secondary" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary"> = {
      'CONSULTA': 'info',
      'RECONSULTA': 'info',
      'SESION': 'success',
      'CONTROL': 'warn'
    };
    return severities[tipo] || 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PROGRAMADA': 'Programada',
      'CONFIRMADA': 'Confirmada',
      'EN_ATENCION': 'En Atención',
      'COMPLETADA': 'Completada',
      'CANCELADA': 'Cancelada',
      'NO_ASISTIO': 'No Asistió'
    };
    return labels[estado] || estado;
  }

  getEstadoSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary"> = {
      'PROGRAMADA': 'secondary',
      'CONFIRMADA': 'info',
      'EN_ATENCION': 'warn',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger',
      'NO_ASISTIO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  formatHora(fecha: string): string {
    return new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  formatFechaCorta(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long'
    });
  }

  getInicialPaciente(cita: Cita): string {
    return cita.pacienteNombre ? cita.pacienteNombre.charAt(0) : 'P';
  }
}