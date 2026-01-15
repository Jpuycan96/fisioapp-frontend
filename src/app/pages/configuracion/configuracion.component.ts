import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Configuración" subtitle="Ajustes del sistema"></app-page-header>
    <p>Configuración (próximamente)</p>
  `
})
export class ConfiguracionComponent {}