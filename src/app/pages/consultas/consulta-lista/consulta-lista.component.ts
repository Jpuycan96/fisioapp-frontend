import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConsultaService } from '../../../services/consulta.service';
import { Consulta } from '../../../models';

@Component({
  selector: 'app-consulta-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    CheckboxModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './consulta-lista.component.html',
  styleUrl: './consulta-lista.component.scss'
})
export class ConsultaListaComponent implements OnInit {
  consultas: Consulta[] = [];
  loading = true;
  fechaSeleccionada: Date = new Date();
  mostrarTodas = true;

  constructor(
    private consultaService: ConsultaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadConsultas();
  }

  loadConsultas(): void {
    this.loading = true;
    
    if (this.mostrarTodas) {
      this.consultaService.getAll().subscribe({
        next: (data) => {
          this.consultas = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando consultas', err);
          this.loading = false;
        }
      });
    } else {
      const fecha = this.formatDate(this.fechaSeleccionada);
      this.consultaService.getByFecha(fecha).subscribe({
        next: (data) => {
          this.consultas = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando consultas', err);
          this.loading = false;
        }
      });
    }
  }

  onFechaChange(): void {
    if (!this.mostrarTodas) {
      this.loadConsultas();
    }
  }

  onMostrarTodasChange(): void {
    this.loadConsultas();
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'CONSULTA_INICIAL': 'Consulta Inicial',
      'RECONSULTA': 'Reconsulta'
    };
    return labels[tipo] || tipo;
  }

  getTipoSeverity(tipo: string): "success" | "info" | "warn" | "danger" | "secondary" | undefined {
    return tipo === 'CONSULTA_INICIAL' ? 'info' : 'success';
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    
    // La fecha viene como "2026-01-13", la convertimos a "13/01/2026"
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }
}