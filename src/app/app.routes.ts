import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pages/pacientes/paciente-lista/paciente-lista.component')
          .then(m => m.PacienteListaComponent)
      },
      {
        path: 'pacientes/nuevo',
        loadComponent: () => import('./pages/pacientes/paciente-form/paciente-form.component')
          .then(m => m.PacienteFormComponent)
      },
      {
        path: 'pacientes/:id',
        loadComponent: () => import('./pages/pacientes/paciente-detalle/paciente-detalle.component')
          .then(m => m.PacienteDetalleComponent)
      },
      {
        path: 'pacientes/:id/editar',
        loadComponent: () => import('./pages/pacientes/paciente-form/paciente-form.component')
          .then(m => m.PacienteFormComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./pages/citas/cita-lista/cita-lista.component')
          .then(m => m.CitaListaComponent)
      },
      {
        path: 'consultas',
        loadComponent: () => import('./pages/consultas/consulta-lista/consulta-lista.component')
          .then(m => m.ConsultaListaComponent)
      },
      {
        path: 'consultas/nueva',
        loadComponent: () => import('./pages/consultas/consulta-form/consulta-form.component')
          .then(m => m.ConsultaFormComponent)
      },
      {
        path: 'consultas/:id',
        loadComponent: () => import('./pages/consultas/consulta-detalle/consulta-detalle.component')
          .then(m => m.ConsultaDetalleComponent)
      },
      {
        path: 'planes',
        loadComponent: () => import('./pages/planes/plan-lista/plan-lista.component')
          .then(m => m.PlanListaComponent)
      },
      {
        path: 'planes/nuevo',
        loadComponent: () => import('./pages/planes/plan-form/plan-form.component')
          .then(m => m.PlanFormComponent)
      },
      {
        path: 'planes/:id',
        loadComponent: () => import('./pages/planes/plan-detalle/plan-detalle.component')
          .then(m => m.PlanDetalleComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/configuracion/configuracion.component')
          .then(m => m.ConfiguracionComponent)
      },
      {
        path: 'sesiones/nueva',
        loadComponent: () => import('./pages/sesiones/sesion-form/sesion-form.component')
          .then(m => m.SesionFormComponent)
      },
      {
        path: 'tecnicas',
        loadComponent: () => import('./pages/tecnicas/tecnica-lista/tecnica-lista.component')
          .then(m => m.TecnicaListaComponent)
      },
      {
        path: 'pagos',
        loadComponent: () => import('./pages/pagos/pago-lista/pago-lista.component')
          .then(m => m.PagoListaComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/citas/cita-agenda/cita-agenda.component')
          .then(m => m.CitaAgendaComponent)
      },
      
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
