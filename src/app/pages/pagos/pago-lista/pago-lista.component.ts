import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PagoService } from '../../../services/pago.service';
import { Pago, ResumenPagos } from '../../../models';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-pago-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    DropdownModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pago-lista.component.html',
  styleUrl: './pago-lista.component.scss'
})
export class PagoListaComponent implements OnInit {
  pagos: Pago[] = [];
  loading = true;
  
  // Filtros
  fechaSeleccionada: Date = new Date();
  mostrarTodos = false;
  
  // Resumen
  resumen: ResumenPagos | null = null;

  metodoPagoOptions = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Yape', value: 'YAPE' },
    { label: 'Plin', value: 'PLIN' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Tarjeta', value: 'TARJETA' }
  ];

  constructor(
    private pagoService: PagoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    this.loading = true;
    
    if (this.mostrarTodos) {
      this.pagoService.getAll().subscribe({
        next: (data) => {
          this.pagos = data;
          this.loading = false;
          this.calcularResumenLocal();
        },
        error: (err) => {
          console.error('Error cargando pagos', err);
          this.loading = false;
        }
      });
    } else {
      const fecha = this.formatDate(this.fechaSeleccionada);
      this.pagoService.getByFecha(fecha).subscribe({
        next: (data) => {
          this.pagos = data;
          this.loading = false;
          this.loadResumenDia(fecha);
        },
        error: (err) => {
          console.error('Error cargando pagos', err);
          this.loading = false;
        }
      });
    }
  }

  loadResumenDia(fecha: string): void {
    this.pagoService.getResumenDia(fecha).subscribe({
      next: (resumen) => {
        this.resumen = resumen;
      },
      error: (err) => console.error('Error cargando resumen', err)
    });
  }

  calcularResumenLocal(): void {
    const total = this.pagos
      .filter(p => p.estado === 'APLICADO')
      .reduce((sum, p) => sum + p.monto, 0);
    
    this.resumen = {
      totalIngresos: total,
      cantidadPagos: this.pagos.length
    };
  }

  onFechaChange(): void {
    if (!this.mostrarTodos) {
      this.loadPagos();
    }
  }

  onMostrarTodosChange(): void {
    this.loadPagos();
  }

  verHoy(): void {
    this.fechaSeleccionada = new Date();
    this.mostrarTodos = false;
    this.loadPagos();
  }

  marcarDevuelto(pago: Pago): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de marcar como devuelto el pago de S/. ${pago.monto.toFixed(2)}?`,
      header: 'Confirmar Devolución',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, devolver',
      rejectLabel: 'No',
      accept: () => {
        this.pagoService.marcarDevuelto(pago.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pago marcado como devuelto'
            });
            this.loadPagos();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo marcar como devuelto'
            });
          }
        });
      }
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ADELANTO_CITA': 'Adelanto Cita',
      'ADELANTO_CONSULTA': 'Adelanto Consulta',
      'PAGO_CONSULTA': 'Pago Consulta',
      'ADELANTO_PLAN': 'Adelanto Plan',
      'PAGO_PLAN_COMPLETO': 'Pago Plan Completo',
      'PAGO_SESION': 'Pago Sesión',
      'DEVOLUCION': 'Devolución'
    };
    return labels[tipo] || tipo;
  }

  getTipoSeverity(tipo: string): "success" | "info" | "warn" | "danger" | "secondary" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary"> = {
      'ADELANTO_CITA': 'info',
      'ADELANTO_CONSULTA': 'info',
      'PAGO_CONSULTA': 'success',
      'ADELANTO_PLAN': 'warn',
      'PAGO_PLAN_COMPLETO': 'success',
      'PAGO_SESION': 'success',
      'DEVOLUCION': 'danger'
    };
    return severities[tipo] || 'secondary';
  }

  getMetodoLabel(metodo: string): string {
    const labels: Record<string, string> = {
      'EFECTIVO': 'Efectivo',
      'YAPE': 'Yape',
      'PLIN': 'Plin',
      'TRANSFERENCIA': 'Transferencia',
      'TARJETA': 'Tarjeta'
    };
    return labels[metodo] || metodo;
  }

  getMetodoIcon(metodo: string): string {
    const icons: Record<string, string> = {
      'EFECTIVO': 'pi pi-money-bill',
      'YAPE': 'pi pi-mobile',
      'PLIN': 'pi pi-mobile',
      'TRANSFERENCIA': 'pi pi-building',
      'TARJETA': 'pi pi-credit-card'
    };
    return icons[metodo] || 'pi pi-wallet';
  }

  getEstadoSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary"> = {
      'APLICADO': 'success',
      'PENDIENTE': 'warn',
      'DEVUELTO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const [datePart] = fecha.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  formatHora(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}