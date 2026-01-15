import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PlanTratamientoService } from '../../../services/plan-tratamiento.service';
import { PacienteService } from '../../../services/paciente.service';
import { TecnicaService } from '../../../services/tecnica.service';
import { ConfiguracionService } from '../../../services/configuracion.service';
import { Paciente, Tecnica, PlanTratamientoRequest } from '../../../models';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule,
    DividerModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss'
})
export class PlanFormComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;

  paciente: Paciente | null = null;
  pacienteId: number | null = null;
  consultaId: number | null = null;

  tecnicas: Tecnica[] = [];
  descuentoPagoCompleto = 20;

  frecuenciaOptions = [
    { label: '1 vez por semana', value: '1 vez por semana' },
    { label: '2 veces por semana', value: '2 veces por semana' },
    { label: '3 veces por semana', value: '3 veces por semana' },
    { label: 'Diario', value: 'Diario' },
    { label: 'Quincenal', value: 'Quincenal' }
  ];

  constructor(
    private fb: FormBuilder,
    private planService: PlanTratamientoService,
    private pacienteService: PacienteService,
    private tecnicaService: TecnicaService,
    private configuracionService: ConfiguracionService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.queryParams.subscribe(params => {
      this.pacienteId = params['pacienteId'] ? +params['pacienteId'] : null;
      this.consultaId = params['consultaId'] ? +params['consultaId'] : null;

      if (this.pacienteId) {
        this.loadPaciente();
      } else {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se especificó el paciente'
        });
      }

      if (!this.consultaId) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se especificó la consulta. Debe crear el plan desde una consulta.'
        });
      }
    });

    this.loadTecnicas();
    this.loadDescuento();
  }

  initForm(): void {
    this.form = this.fb.group({
      diagnostico: ['', Validators.required],
      numeroSesiones: [10, [Validators.required, Validators.min(1)]],
      frecuenciaSugerida: ['2 veces por semana'],
      observaciones: [''],
      tecnicasArray: this.fb.array([]),
      aplicarDescuento: [false]
    });
  }

  loadPaciente(): void {
    if (!this.pacienteId) return;

    this.pacienteService.getById(this.pacienteId).subscribe({
      next: (paciente) => {
        this.paciente = paciente;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el paciente'
        });
        this.loading = false;
      }
    });
  }

  loadTecnicas(): void {
    this.tecnicaService.getActivas().subscribe({
      next: (tecnicas) => {
        this.tecnicas = tecnicas;
        if (tecnicas.length > 0) {
          this.agregarTecnica();
        }
      },
      error: (err) => console.error('Error cargando técnicas', err)
    });
  }

  loadDescuento(): void {
    this.configuracionService.getByKey('descuento_pago_completo').subscribe({
      next: (config) => {
        this.descuentoPagoCompleto = parseFloat(config.valor);
      },
      error: () => {
        console.log('Usando descuento por defecto: 20%');
      }
    });
  }

  get tecnicasArray(): FormArray {
    return this.form.get('tecnicasArray') as FormArray;
  }

  get f() {
    return this.form.controls;
  }

  agregarTecnica(): void {
    const tecnicaForm = this.fb.group({
      tecnicaId: [null, Validators.required]
    });
    this.tecnicasArray.push(tecnicaForm);
  }

  eliminarTecnica(index: number): void {
    this.tecnicasArray.removeAt(index);
  }

  getTecnicaPrecio(tecnicaId: number): number {
    if (!tecnicaId) return 0;
    const tecnica = this.tecnicas.find(t => t.id === tecnicaId);
    return tecnica?.precio || 0;
  }

  // Costo por sesión = suma de precios de todas las técnicas seleccionadas
  calcularCostoPorSesion(): number {
    let total = 0;
    for (const control of this.tecnicasArray.controls) {
      const tecnicaId = control.get('tecnicaId')?.value;
      if (tecnicaId) {
        total += this.getTecnicaPrecio(tecnicaId);
      }
    }
    return total;
  }

  // Costo total = costo por sesión × número de sesiones
  calcularCostoTotal(): number {
    const costoPorSesion = this.calcularCostoPorSesion();
    const numeroSesiones = this.form.get('numeroSesiones')?.value || 1;
    return costoPorSesion * numeroSesiones;
  }

  // Costo con descuento aplicado
  calcularCostoConDescuento(): number {
    const total = this.calcularCostoTotal();
    const aplicarDescuento = this.form.get('aplicarDescuento')?.value;
    if (aplicarDescuento) {
      return total * (1 - this.descuentoPagoCompleto / 100);
    }
    return total;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor complete los campos requeridos'
      });
      return;
    }

    if (!this.pacienteId || !this.consultaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe crear el plan desde una consulta'
      });
      return;
    }

    // Obtener IDs de técnicas seleccionadas (sin duplicados)
    const tecnicaIds: number[] = this.tecnicasArray.controls
      .map(control => control.get('tecnicaId')?.value)
      .filter((id): id is number => id !== null && id !== undefined);

    // Validar que no haya técnicas duplicadas
    const uniqueTecnicaIds = [...new Set(tecnicaIds)];

    if (uniqueTecnicaIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin técnicas',
        detail: 'Agregue al menos una técnica al plan'
      });
      return;
    }

    this.saving = true;
    const formValue = this.form.value;

    // Request que coincide exactamente con PlanTratamientoRequest.java
    const request: PlanTratamientoRequest = {
      pacienteId: this.pacienteId,
      consultaId: this.consultaId,
      diagnostico: formValue.diagnostico,
      numeroSesiones: formValue.numeroSesiones,
      frecuenciaSugerida: formValue.frecuenciaSugerida || undefined,
      porcentajeDescuento: formValue.aplicarDescuento ? this.descuentoPagoCompleto : 0,
      observaciones: formValue.observaciones || undefined,
      tecnicaIds: uniqueTecnicaIds
    };

    this.planService.create(request).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Plan de tratamiento creado correctamente'
        });
        setTimeout(() => {
          this.router.navigate(['/planes', result.id]);
        }, 1500);
      },
      error: (err) => {
        console.error('Error creando plan', err);
        const mensaje = err.error?.validationErrors 
          ? Object.values(err.error.validationErrors).join(', ')
          : err.error?.message || 'No se pudo crear el plan';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
        this.saving = false;
      }
    });
  }
}