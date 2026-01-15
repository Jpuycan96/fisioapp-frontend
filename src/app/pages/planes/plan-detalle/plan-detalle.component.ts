import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlanTratamientoService } from '../../../services/plan-tratamiento.service';
import { SesionService } from '../../../services/sesion.service';
import { PagoService } from '../../../services/pago.service';
import { AuthService } from '../../../services/auth.service';
import { PlanTratamiento, ModalidadPago, Sesion, Pago, PagoRequest, TipoPago, MetodoPago } from '../../../models';

@Component({
  selector: 'app-plan-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TagModule,
    DividerModule,
    DialogModule,
    RadioButtonModule,
    CheckboxModule,
    ToastModule,
    ProgressBarModule,
    TableModule,
    InputNumberModule,
    DropdownModule,
    TextareaModule,
    ConfirmDialogModule,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './plan-detalle.component.html',
  styleUrl: './plan-detalle.component.scss'
})
export class PlanDetalleComponent implements OnInit {
  plan: PlanTratamiento | null = null;
  sesiones: Sesion[] = [];
  pagos: Pago[] = [];
  loading = true;
  loadingSesiones = false;
  loadingPagos = false;
  planId: number | null = null;

  // Modal de confirmación
  mostrarModalConfirmar = false;
  modalidadSeleccionada: ModalidadPago = 'PAGO_POR_SESION';
  aplicarDescuento = true;
  confirmando = false;

  // Modal de pago
  mostrarModalPago = false;
  registrandoPago = false;
  pagoMonto: number = 0;
  pagoMetodo: MetodoPago = 'EFECTIVO';
  pagoTipo: TipoPago = 'PAGO_SESION';
  pagoNotas: string = '';

  metodoPagoOptions = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Yape', value: 'YAPE' },
    { label: 'Plin', value: 'PLIN' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Tarjeta', value: 'TARJETA' }
  ];

  tipoPagoOptions = [
    { label: 'Pago de Sesión', value: 'PAGO_SESION' },
    { label: 'Abono al Plan', value: 'ADELANTO_PLAN' },
    { label: 'Pago Completo', value: 'PAGO_PLAN_COMPLETO' }
  ];

  constructor(
    private planService: PlanTratamientoService,
    private sesionService: SesionService,
    private pagoService: PagoService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = +params['id'];
      if (this.planId) {
        this.loadPlan();
      }
    });
  }

  loadPlan(): void {
    if (!this.planId) return;

    this.loading = true;
    this.planService.getById(this.planId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.loading = false;
        
        if (plan.estado === 'EN_CURSO' || plan.estado === 'COMPLETADO' || plan.sesionesCompletadas > 0) {
          this.loadSesiones();
        }
        
        if (plan.modalidadPago !== 'PENDIENTE') {
          this.loadPagos();
        }
      },
      error: (err) => {
        console.error('Error cargando plan', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el plan'
        });
        this.loading = false;
      }
    });
  }

  loadSesiones(): void {
    if (!this.planId) return;

    this.loadingSesiones = true;
    this.sesionService.getByPlan(this.planId).subscribe({
      next: (sesiones) => {
        this.sesiones = sesiones;
        this.loadingSesiones = false;
      },
      error: (err) => {
        console.error('Error cargando sesiones', err);
        this.loadingSesiones = false;
      }
    });
  }

  loadPagos(): void {
    if (!this.planId) return;

    this.loadingPagos = true;
    this.pagoService.getByPlan(this.planId).subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.loadingPagos = false;
      },
      error: (err) => {
        console.error('Error cargando pagos', err);
        this.loadingPagos = false;
      }
    });
  }

  // ========== MODAL CONFIRMAR PLAN ==========
  abrirModalConfirmar(): void {
    this.modalidadSeleccionada = 'PAGO_POR_SESION';
    this.aplicarDescuento = true;
    this.mostrarModalConfirmar = true;
  }

  confirmarPlan(): void {
    if (!this.planId) return;

    this.confirmando = true;
    const aplicar = this.modalidadSeleccionada === 'PAGO_COMPLETO' ? this.aplicarDescuento : false;

    this.planService.confirmar(this.planId, this.modalidadSeleccionada, aplicar).subscribe({
      next: (planActualizado) => {
        this.plan = planActualizado;
        this.mostrarModalConfirmar = false;
        this.confirmando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Plan Confirmado',
          detail: 'El plan ha sido aceptado por el paciente'
        });
        
        if (this.modalidadSeleccionada === 'PAGO_COMPLETO') {
          setTimeout(() => this.abrirModalPago('PAGO_PLAN_COMPLETO'), 500);
        }
      },
      error: (err) => {
        console.error('Error confirmando plan', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo confirmar el plan'
        });
        this.confirmando = false;
      }
    });
  }

  // ========== MODAL REGISTRAR PAGO ==========
  abrirModalPago(tipo: TipoPago = 'PAGO_SESION'): void {
    if (!this.plan) return;
    
    this.pagoTipo = tipo;
    this.pagoMetodo = 'EFECTIVO';
    this.pagoNotas = '';
    
    if (tipo === 'PAGO_PLAN_COMPLETO') {
      this.pagoMonto = this.plan.saldoPendiente;
    } else if (tipo === 'PAGO_SESION') {
      this.pagoMonto = this.plan.costoPorSesion;
    } else {
      this.pagoMonto = 0;
    }
    
    this.mostrarModalPago = true;
  }

  registrarPago(): void {
    if (!this.plan || !this.planId || this.pagoMonto <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Ingrese un monto válido'
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    
    const pagoRequest: PagoRequest = {
      pacienteId: this.plan.pacienteId,
      planId: this.planId,
      tipo: this.pagoTipo,
      monto: this.pagoMonto,
      metodoPago: this.pagoMetodo,
      concepto: this.getConceptoPago(),
      notas: this.pagoNotas || undefined,
      registradoPorId: currentUser?.id || 1
    };

    this.registrandoPago = true;
    this.pagoService.create(pagoRequest).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Pago Registrado',
          detail: `Se registró el pago de S/. ${this.pagoMonto.toFixed(2)}`
        });
        this.mostrarModalPago = false;
        this.registrandoPago = false;
        this.loadPlan();
      },
      error: (err) => {
        console.error('Error registrando pago', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el pago'
        });
        this.registrandoPago = false;
      }
    });
  }

  getConceptoPago(): string {
    if (!this.plan) return '';
    
    const conceptos: Record<string, string> = {
      'PAGO_SESION': `Pago sesión - Plan #${this.planId}`,
      'ADELANTO_PLAN': `Abono al plan #${this.planId}`,
      'PAGO_PLAN_COMPLETO': `Pago completo - Plan #${this.planId}`
    };
    return conceptos[this.pagoTipo] || `Pago - Plan #${this.planId}`;
  }

  // ========== CAMBIAR ESTADO ==========
  cambiarEstado(nuevoEstado: 'EN_CURSO' | 'COMPLETADO' | 'ABANDONADO'): void {
    if (!this.planId) return;

    const mensajes: Record<string, string> = {
      'EN_CURSO': '¿Iniciar el tratamiento?',
      'COMPLETADO': '¿Marcar como completado?',
      'ABANDONADO': '¿Marcar como abandonado?'
    };

    this.confirmationService.confirm({
      message: mensajes[nuevoEstado],
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.planService.updateEstado(this.planId!, nuevoEstado).subscribe({
          next: (planActualizado) => {
            this.plan = planActualizado;
            this.messageService.add({
              severity: 'success',
              summary: 'Estado actualizado',
              detail: `El plan ahora está ${this.getEstadoLabel(nuevoEstado)}`
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el estado'
            });
          }
        });
      }
    });
  }

  // ========== HELPERS ==========
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

  getEstadoSeverity(estado: string): "success" | "info" | "warn" | "danger" | "secondary" {
    const severities: Record<string, "success" | "info" | "warn" | "danger" | "secondary"> = {
      'PROPUESTO': 'warn',
      'ACEPTADO': 'info',
      'EN_CURSO': 'success',
      'COMPLETADO': 'success',
      'ABANDONADO': 'danger'
    };
    return severities[estado] || 'secondary';
  }

  getModalidadLabel(modalidad: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'PAGO_COMPLETO': 'Pago Completo',
      'PAGO_POR_SESION': 'Pago por Sesión'
    };
    return labels[modalidad] || modalidad;
  }

  getProgreso(): number {
    if (!this.plan) return 0;
    return (this.plan.sesionesCompletadas / this.plan.numeroSesiones) * 100;
  }

  getCostoAplicable(): number {
    if (!this.plan) return 0;
    return this.plan.modalidadPago === 'PAGO_COMPLETO' 
      ? this.plan.costoConDescuento 
      : this.plan.costoTotal;
  }

  getTipoPagoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ADELANTO_CITA': 'Adelanto Cita',
      'ADELANTO_CONSULTA': 'Adelanto Consulta',
      'PAGO_CONSULTA': 'Pago Consulta',
      'ADELANTO_PLAN': 'Abono',
      'PAGO_PLAN_COMPLETO': 'Pago Completo',
      'PAGO_SESION': 'Pago Sesión',
      'DEVOLUCION': 'Devolución'
    };
    return labels[tipo] || tipo;
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

  getEvaLabel(value: number | null): string {
    if (value === null || value === undefined) return '-';
    if (value === 0) return 'Sin dolor';
    if (value <= 3) return 'Leve';
    if (value <= 6) return 'Moderado';
    if (value <= 9) return 'Severo';
    return 'Insoportable';
  }

  getEvaSeverity(value: number | null): "success" | "info" | "warn" | "danger" | "secondary" {
    if (value === null || value === undefined) return 'secondary';
    if (value <= 3) return 'success';
    if (value <= 6) return 'warn';
    return 'danger';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    const [datePart] = fecha.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  formatFechaHora(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}