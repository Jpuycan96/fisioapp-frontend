import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PacienteService } from '../../../services/paciente.service';
import { PacienteRequest } from '../../../models';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    DatePickerModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.scss'
})
export class PacienteFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  saving = false;
  isEdit = false;
  pacienteId: number | null = null;
  today = new Date();

  sexoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
  ];

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      dni: ['', [Validators.required, Validators.maxLength(15)]],
      fechaNacimiento: [null],
      sexo: [null],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      direccion: ['', Validators.maxLength(255)],
      ocupacion: ['', Validators.maxLength(100)],
      alergias: [''],
      medicamentos: [''],
      condicionesPreexistentes: [''],
      contactoEmergenciaNombre: ['', Validators.maxLength(100)],
      contactoEmergenciaTelefono: ['', Validators.maxLength(20)],
      contactoEmergenciaParentesco: ['', Validators.maxLength(50)]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.pacienteId = +id;
      this.loadPaciente();
    }
  }

  loadPaciente(): void {
    if (!this.pacienteId) return;

    this.loading = true;
    this.pacienteService.getById(this.pacienteId).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          ...paciente,
          fechaNacimiento: paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento) : null
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando paciente', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el paciente'
        });
        this.loading = false;
        this.router.navigate(['/pacientes']);
      }
    });
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

    this.saving = true;
    const formValue = this.form.value;

    const paciente: PacienteRequest = {
      ...formValue,
      fechaNacimiento: formValue.fechaNacimiento 
        ? this.formatDate(formValue.fechaNacimiento) 
        : null
    };

    const request = this.isEdit
      ? this.pacienteService.update(this.pacienteId!, paciente)
      : this.pacienteService.create(paciente);

    request.subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEdit ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente'
        });
        setTimeout(() => {
          this.router.navigate(['/pacientes', result.id]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error guardando paciente', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo guardar el paciente'
        });
        this.saving = false;
      }
    });
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