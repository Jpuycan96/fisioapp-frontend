import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { CitaService } from '../../../services/cita.service';
import { PacienteService } from '../../../services/paciente.service';
import { PlanTratamientoService } from '../../../services/plan-tratamiento.service';
import { Paciente, CitaRequest, PlanTratamiento } from '../../../models';

interface AutoCompleteEvent {
  query: string;
}

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    TagModule
  ],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss'
})
export class CitaFormComponent implements OnInit, OnChanges {
  @Input() fechaInicial: Date = new Date();
  @Input() pacienteIdInicial: number | null = null;
  @Input() planIdInicial: number | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  form: FormGroup;
  saving = false;
  loadingPlan = false;
  
  pacientesSugeridos: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  planSeleccionado: PlanTratamiento | null = null;

  tipoOptions = [
    { label: 'Consulta', value: 'CONSULTA' },
    { label: 'Reconsulta', value: 'RECONSULTA' },
    { label: 'Sesión', value: 'SESION' },
    { label: 'Control', value: 'CONTROL' }
  ];

  horasDisponibles: { label: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private citaService: CitaService,
    private pacienteService: PacienteService,
    private planService: PlanTratamientoService
  ) {
    this.form = this.fb.group({
      paciente: [null, Validators.required],
      fecha: [new Date(), Validators.required],
      hora: [null, Validators.required],
      tipo: ['CONSULTA', Validators.required],
      notas: ['']
    });

    this.generarHorasDisponibles();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pacienteIdInicial'] || changes['planIdInicial']) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.fechaInicial) {
      this.form.patchValue({ fecha: this.fechaInicial });
    }

    // Si viene con un plan, cargar datos
    if (this.planIdInicial) {
      this.loadPlanData();
    } else if (this.pacienteIdInicial) {
      this.loadPacienteData();
    }
  }

  loadPlanData(): void {
    if (!this.planIdInicial) return;

    this.loadingPlan = true;
    this.planService.getById(this.planIdInicial).subscribe({
      next: (plan) => {
        this.planSeleccionado = plan;
        // Cargar el paciente del plan
        this.pacienteService.getById(plan.pacienteId).subscribe({
          next: (paciente) => {
            this.pacienteSeleccionado = paciente;
            this.form.patchValue({
              paciente: paciente,
              tipo: 'SESION' // Forzar tipo SESION
            });
            this.loadingPlan = false;
          },
          error: () => {
            this.loadingPlan = false;
          }
        });
      },
      error: () => {
        this.loadingPlan = false;
      }
    });
  }

  loadPacienteData(): void {
    if (!this.pacienteIdInicial) return;

    this.pacienteService.getById(this.pacienteIdInicial).subscribe({
      next: (paciente) => {
        this.pacienteSeleccionado = paciente;
        this.form.patchValue({ paciente: paciente });
      }
    });
  }

  generarHorasDisponibles(): void {
    const horas = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        horas.push({ label: hora, value: hora });
      }
    }
    this.horasDisponibles = horas;
  }

  buscarPacientes(event: AutoCompleteEvent): void {
    // Si hay un plan, no permitir cambiar paciente
    if (this.planSeleccionado) return;

    const query = event.query;
    if (query.length >= 2) {
      this.pacienteService.buscar(query).subscribe({
        next: (pacientes) => {
          this.pacientesSugeridos = pacientes;
        },
        error: () => {
          this.pacientesSugeridos = [];
        }
      });
    }
  }

  onPacienteSelect(event: AutoCompleteSelectEvent): void {
    this.pacienteSeleccionado = event.value as Paciente;
  }

  getNumeroSesionSiguiente(): number {
    if (!this.planSeleccionado) return 1;
    return this.planSeleccionado.sesionesCompletadas + 1;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.pacienteSeleccionado) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.form.value;
    
    const fecha = this.formatDate(formValue.fecha);
    const fechaHora = `${fecha}T${formValue.hora}:00`;

    const cita: CitaRequest = {
      pacienteId: this.pacienteSeleccionado.id,
      fechaHora: fechaHora,
      tipo: formValue.tipo,
      notas: formValue.notas || undefined,
      atendidoPorId: 1, // Por ahora hardcodeado
      planId: this.planSeleccionado?.id || undefined,
      numeroSesion: this.planSeleccionado ? this.getNumeroSesionSiguiente() : undefined
    };

    this.citaService.create(cita).subscribe({
      next: () => {
        this.saving = false;
        this.guardado.emit();
      },
      error: (err) => {
        console.error('Error creando cita', err);
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.cancelado.emit();
  }

  resetForm(): void {
    this.form.reset({
      fecha: new Date(),
      tipo: 'CONSULTA'
    });
    this.pacienteSeleccionado = null;
    this.planSeleccionado = null;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get f() {
    return this.form.controls;
  }
}