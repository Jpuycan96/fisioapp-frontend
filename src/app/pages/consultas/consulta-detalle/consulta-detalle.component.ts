import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultaService } from '../../../services/consulta.service';
import { Consulta } from '../../../models';

@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    CardModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './consulta-detalle.component.html',
  styleUrl: './consulta-detalle.component.scss'
})
export class ConsultaDetalleComponent implements OnInit {
  consulta: Consulta | null = null;
  loading = true;

  constructor(
    private consultaService: ConsultaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadConsulta(+id);
    }
  }

  loadConsulta(id: number): void {
    this.loading = true;
    this.consultaService.getById(id).subscribe({
      next: (data) => {
        this.consulta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando consulta', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la consulta'
        });
        this.loading = false;
        this.router.navigate(['/citas']);
      }
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'EVALUACION': 'Evaluación',
      'REEVALUACION': 'Reevaluación',
      'CONTROL': 'Control',
      'ALTA': 'Alta'
    };
    return labels[tipo] || tipo;
  }

  getSeveridadSeverity(severidad: string): "success" | "warn" | "danger" | undefined {
    const severities: Record<string, "success" | "warn" | "danger"> = {
      'LEVE': 'success',
      'MODERADO': 'warn',
      'SEVERO': 'danger'
    };
    return severities[severidad];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}