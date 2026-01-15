import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SesionService } from '../../../services/sesion.service';
import { PlanTratamientoService } from '../../../services/plan-tratamiento.service';
import { PacienteService } from '../../../services/paciente.service';
import { TecnicaService } from '../../../services/tecnica.service';
import { PlanTratamiento, Paciente, Tecnica, SesionRequest } from '../../../models';

@Component({
  selector: 'app-sesion-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SliderModule,
    MultiSelectModule,
    TagModule,
    DividerModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './sesion-form.component.html',
  styleUrl: './sesion-form.component.scss'
})
export class SesionFormComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;

  citaId: number | null = null;
  planId: number | null = null;
  pacienteId: number | null = null;
  numeroSesion: number = 1;

  plan: PlanTratamiento | null = null;
  paciente: Paciente | null = null;
  tecnicasDisponibles: Tecnica[] = [];

  constructor(
    private fb: FormBuilder,
    private sesionService: SesionService,
    private planService: PlanTratamientoService,
    private pacienteService: PacienteService,
    private tecnicaService: TecnicaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.queryParams.subscribe(params => {
      this.citaId = params['citaId'] ? +params['citaId'] : null;
      this.planId = params['planId'] ? +params['planId'] : null;
      this.pacienteId = params['pacienteId'] ? +params['pacienteId'] : null;
      this.numeroSesion = params['numeroSesion'] ? +params['numeroSesion'] : 1;

      if (this.planId) {
        this.loadData();
      } else {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se especificó el plan de tratamiento'
        });
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      escalaEva: [null, [Validators.min(0), Validators.max(10)]],
      pesoKg: [null],
      tallaCm: [null],
      observaciones: [''],
      tecnicasAplicadas: [[], Validators.required]
    });
  }

  loadData(): void {
    this.loading = true;

    // Cargar plan
    if (this.planId) {
      this.planService.getById(this.planId).subscribe({
        next: (plan) => {
          this.plan = plan;
          // Pre-seleccionar las técnicas del plan
          if (plan.tecnicas) {
            const tecnicaIds = plan.tecnicas.map(t => t.id);
            this.form.patchValue({ tecnicasAplicadas: tecnicaIds });
          }
          this.loadPaciente();
        },
        error: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el plan'
          });
        }
      });
    }

    // Cargar técnicas disponibles
    this.tecnicaService.getActivas().subscribe({
      next: (tecnicas) => {
        this.tecnicasDisponibles = tecnicas;
      }
    });
  }

  loadPaciente(): void {
    if (this.pacienteId) {
      this.pacienteService.getById(this.pacienteId).subscribe({
        next: (paciente) => {
          this.paciente = paciente;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else if (this.plan) {
      this.pacienteService.getById(this.plan.pacienteId).subscribe({
        next: (paciente) => {
          this.paciente = paciente;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  getEvaLabel(value: number | null): string {
    if (value === null) return 'No evaluado';
    if (value === 0) return 'Sin dolor';
    if (value <= 3) return 'Dolor leve';
    if (value <= 6) return 'Dolor moderado';
    if (value <= 9) return 'Dolor severo';
    return 'Dolor insoportable';
  }

  getEvaColor(value: number | null): string {
    if (value === null) return '#94a3b8';
    if (value <= 3) return '#22c55e';
    if (value <= 6) return '#f59e0b';
    return '#ef4444';
  }

  onSubmit(): void {
    if (this.form.invalid || !this.planId) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor complete los campos requeridos'
      });
      return;
    }

    this.saving = true;
    const formValue = this.form.value;

    const sesion: SesionRequest = {
      planId: this.planId,
      numeroSesion: this.numeroSesion,
      fecha: new Date().toISOString(),
      escalaEva: formValue.escalaEva,
      pesoKg: formValue.pesoKg || undefined,
      tallaCm: formValue.tallaCm || undefined,
      observaciones: formValue.observaciones || undefined,
      atendidoPorId: 1, // Por ahora hardcodeado
      tecnicaIds: formValue.tecnicasAplicadas
    };

    this.sesionService.create(sesion).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sesión Registrada',
          detail: `Sesión ${this.numeroSesion} registrada correctamente`
        });
        setTimeout(() => {
          this.router.navigate(['/planes', this.planId]);
        }, 1500);
      },
      error: (err) => {
        console.error('Error registrando sesión', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo registrar la sesión'
        });
        this.saving = false;
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}