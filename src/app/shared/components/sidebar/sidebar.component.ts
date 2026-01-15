import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Pacientes', icon: 'pi pi-users', route: '/pacientes' },
    { label: 'Agenda', icon: 'pi pi-calendar', route: '/agenda' },
    { label: 'Citas', icon: 'pi pi-calendar-plus', route: '/citas' },
    { label: 'Consultas', icon: 'pi pi-file-edit', route: '/consultas' },
    { label: 'Planes', icon: 'pi pi-list-check', route: '/planes' },
    { label: 'Pagos', icon: 'pi pi-wallet', route: '/pagos' },
  ];

  configItems: MenuItem[] = [
    { label: 'Técnicas', icon: 'pi pi-list', route: '/tecnicas' },
    { label: 'Configuración', icon: 'pi pi-cog', route: '/configuracion' },
  ];

  onToggle(): void {
    this.toggle.emit();
  }
}