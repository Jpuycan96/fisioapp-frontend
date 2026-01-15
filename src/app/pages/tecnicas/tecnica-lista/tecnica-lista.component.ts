import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TecnicaService } from '../../../services/tecnica.service';
import { Tecnica, TecnicaRequest } from '../../../models';
import { CheckboxModule } from 'primeng/checkbox';
@Component({
  selector: 'app-tecnica-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tecnica-lista.component.html',
  styleUrl: './tecnica-lista.component.scss'
})
export class TecnicaListaComponent implements OnInit {
  tecnicas: Tecnica[] = [];
  loading = true;
  
  // Dialog
  showDialog = false;
  dialogTitle = 'Nueva Técnica';
  form!: FormGroup;
  saving = false;
  editingId: number | null = null;

  // Filtro
  mostrarInactivas = false;

  constructor(
    private fb: FormBuilder,
    private tecnicaService: TecnicaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTecnicas();
  }

  initForm(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracionMinutos: [30, [Validators.min(1)]]
    });
  }

  loadTecnicas(): void {
    this.loading = true;
    const request = this.mostrarInactivas 
      ? this.tecnicaService.getTodas()
      : this.tecnicaService.getActivas();

    request.subscribe({
      next: (data) => {
        this.tecnicas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando técnicas', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las técnicas'
        });
        this.loading = false;
      }
    });
  }

  onMostrarInactivasChange(): void {
    this.loadTecnicas();
  }

  nuevaTecnica(): void {
    this.editingId = null;
    this.dialogTitle = 'Nueva Técnica';
    this.form.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      duracionMinutos: 30
    });
    this.showDialog = true;
  }

  editarTecnica(tecnica: Tecnica): void {
    this.editingId = tecnica.id;
    this.dialogTitle = 'Editar Técnica';
    this.form.patchValue({
      codigo: tecnica.codigo,
      nombre: tecnica.nombre,
      descripcion: tecnica.descripcion || '',
      precio: tecnica.precio,
      duracionMinutos: tecnica.duracionMinutos || 30
    });
    this.showDialog = true;
  }

  guardarTecnica(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const tecnica: TecnicaRequest = this.form.value;

    const request = this.editingId
      ? this.tecnicaService.update(this.editingId, tecnica)
      : this.tecnicaService.create(tecnica);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editingId ? 'Técnica actualizada' : 'Técnica creada'
        });
        this.showDialog = false;
        this.saving = false;
        this.loadTecnicas();
      },
      error: (err) => {
        console.error('Error guardando técnica', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo guardar la técnica'
        });
        this.saving = false;
      }
    });
  }

  toggleEstado(tecnica: Tecnica): void {
    const accion = tecnica.activo ? 'desactivar' : 'activar';
    
    this.confirmationService.confirm({
      message: `¿Está seguro de ${accion} la técnica "${tecnica.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        const request = tecnica.activo
          ? this.tecnicaService.deactivate(tecnica.id)
          : this.tecnicaService.activate(tecnica.id);

        request.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Técnica ${accion === 'activar' ? 'activada' : 'desactivada'}`
            });
            this.loadTecnicas();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cambiar el estado'
            });
          }
        });
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}