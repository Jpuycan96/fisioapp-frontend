import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultaService } from '../../../services/consulta.service';
import { PacienteService } from '../../../services/paciente.service';
import { ConfiguracionService, PreciosConsulta } from '../../../services/configuracion.service';
import { AuthService } from '../../../services/auth.service';
import { Paciente, TipoHallazgo, ZonaCorporal, ConsultaRequest } from '../../../models';

@Component({
  selector: 'app-consulta-form',
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
    CardModule,
    DividerModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './consulta-form.component.html',
  styleUrl: './consulta-form.component.scss'
})
export class ConsultaFormComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  
  paciente: Paciente | null = null;
  pacienteId: number | null = null;
  citaId: number | null = null;
  
  tiposHallazgo: TipoHallazgo[] = [];
  zonasCorporales: ZonaCorporal[] = [];
  precios: PreciosConsulta | null = null;

  tipoConsultaOptions = [
    { label: 'Consulta Inicial', value: 'CONSULTA_INICIAL' },
    { label: 'Reconsulta', value: 'RECONSULTA' }
  ];

  tipoPrecioOptions: { label: string; value: string; precio: number | null }[] = [];

  severidadOptions = [
    { label: 'Leve', value: 'LEVE' },
    { label: 'Moderado', value: 'MODERADO' },
    { label: 'Severo', value: 'SEVERO' }
  ];

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultaService,
    private pacienteService: PacienteService,
    private configuracionService: ConfiguracionService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      tipo: ['CONSULTA_INICIAL', Validators.required],
      tipoPrecio: ['NORMAL', Validators.required],
      precioCobrado: [0, [Validators.required, Validators.min(0)]],
      motivoConsulta: ['', Validators.required],
      observacionesClinicas: [''],
      pesoKg: [null],
      tallaCm: [null],
      hallazgos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.pacienteId = params['pacienteId'] ? +params['pacienteId'] : null;
      this.citaId = params['citaId'] ? +params['citaId'] : null;
      
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
    });

    this.loadCatalogos();
    this.loadPrecios();
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

  loadCatalogos(): void {
    this.configuracionService.getTiposHallazgo().subscribe({
      next: (tipos) => this.tiposHallazgo = tipos,
      error: () => console.error('Error cargando tipos de hallazgo')
    });

    this.configuracionService.getZonasCorporales().subscribe({
      next: (zonas) => this.zonasCorporales = zonas,
      error: () => console.error('Error cargando zonas corporales')
    });
  }

  loadPrecios(): void {
    this.configuracionService.getPreciosConsulta().subscribe({
      next: (precios) => {
        this.precios = precios;
        
        // Construir opciones de precio con valores de la BD
        this.tipoPrecioOptions = [
          { label: `Normal (S/. ${precios.normal.toFixed(2)})`, value: 'NORMAL', precio: precios.normal },
          { label: `Referido/Conocido (S/. ${precios.referido.toFixed(2)})`, value: 'REFERIDO', precio: precios.referido },
          { label: 'Cortesía (S/. 0.00)', value: 'CORTESIA', precio: 0 },
          { label: 'Personalizado', value: 'PERSONALIZADO', precio: null }
        ];

        // Establecer precio inicial
        this.form.patchValue({ precioCobrado: precios.normal });
      },
      error: (err) => {
        console.error('Error cargando precios', err);
        // Valores por defecto si falla la carga
        this.tipoPrecioOptions = [
          { label: 'Normal (S/. 150.00)', value: 'NORMAL', precio: 150 },
          { label: 'Referido/Conocido (S/. 110.00)', value: 'REFERIDO', precio: 110 },
          { label: 'Cortesía (S/. 0.00)', value: 'CORTESIA', precio: 0 },
          { label: 'Personalizado', value: 'PERSONALIZADO', precio: null }
        ];
        this.form.patchValue({ precioCobrado: 150 });
      }
    });
  }

  onTipoPrecioChange(event: any): void {
    const tipoPrecio = this.tipoPrecioOptions.find(t => t.value === event.value);
    if (tipoPrecio && tipoPrecio.precio !== null) {
      this.form.patchValue({ precioCobrado: tipoPrecio.precio });
    }
  }

  get hallazgos(): FormArray {
    return this.form.get('hallazgos') as FormArray;
  }

  agregarHallazgo(): void {
    const hallazgoForm = this.fb.group({
      zonaId: [null, Validators.required],
      tipoHallazgoId: [null, Validators.required],
      severidad: ['MODERADO', Validators.required],
      descripcion: ['']
    });
    this.hallazgos.push(hallazgoForm);
  }

  eliminarHallazgo(index: number): void {
    this.hallazgos.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.pacienteId) {
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
    const currentUser = this.authService.getCurrentUser();

    const fechaHoy = new Date();
    const fechaFormateada = this.formatDateLocal(fechaHoy);
    
    // DEBUG - Verificar qué fecha se está enviando
    console.log('Fecha del sistema:', fechaHoy);
    console.log('Fecha formateada:', fechaFormateada);

    const consulta: ConsultaRequest = {
      pacienteId: this.pacienteId,
      tipo: formValue.tipo,
      tipoPrecio: formValue.tipoPrecio,
      precioCobrado: formValue.precioCobrado,
      fecha: fechaFormateada,
      motivoConsulta: formValue.motivoConsulta,
      observacionesClinicas: formValue.observacionesClinicas,
      pesoKg: formValue.pesoKg,
      tallaCm: formValue.tallaCm,
      atendidoPorId: currentUser?.id || 1,
      hallazgos: formValue.hallazgos.length > 0 ? formValue.hallazgos : undefined
    };

    console.log('Consulta a enviar:', consulta);

    this.consultaService.create(consulta).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Consulta registrada correctamente'
        });
        setTimeout(() => {
          this.router.navigate(['/pacientes', this.pacienteId]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error guardando consulta', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo guardar la consulta'
        });
        this.saving = false;
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  private formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
}