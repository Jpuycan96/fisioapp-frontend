export interface Consulta {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  tipo: TipoConsulta;
  tipoPrecio: TipoPrecio;
  precioCobrado: number;
  fecha: string;
  motivoConsulta?: string;
  observacionesClinicas?: string;
  pesoKg?: number;
  tallaCm?: number;
  atendidoPorId: number;
  atendidoPorNombre: string;
  createdAt: string;
  hallazgos?: EvaluacionHallazgo[];
}

export interface ConsultaRequest {
  pacienteId: number;
  tipo: TipoConsulta;
  tipoPrecio?: TipoPrecio;
  precioCobrado: number;
  fecha: string;
  motivoConsulta?: string;
  observacionesClinicas?: string;
  pesoKg?: number;
  tallaCm?: number;
  atendidoPorId: number;
  hallazgos?: EvaluacionHallazgoRequest[];
}

export interface EvaluacionHallazgo {
  id: number;
  zonaId: number;
  zonaNombre: string;
  tipoHallazgoId: number;
  tipoHallazgoNombre: string;
  severidad: Severidad;
  descripcion?: string;
}

export interface EvaluacionHallazgoRequest {
  zonaId: number;
  tipoHallazgoId: number;
  severidad: Severidad;
  descripcion?: string;
}

export interface TipoHallazgo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

export interface ZonaCorporal {
  id: number;
  codigo: string;
  nombre: string;
  region: RegionCorporal;
  vista: VistaCorporal;
  svgPathId?: string;
  activo: boolean;
}

export type TipoConsulta = 'EVALUACION' | 'REEVALUACION' | 'CONTROL' | 'ALTA';
export type TipoPrecio = 'NORMAL' | 'PROMOCION' | 'CONVENIO' | 'CORTESIA';
export type Severidad = 'LEVE' | 'MODERADO' | 'SEVERO';
export type RegionCorporal = 'CABEZA' | 'CUELLO' | 'HOMBRO' | 'BRAZO' | 'ANTEBRAZO' | 'MANO' | 'TORAX' | 'ABDOMEN' | 'ESPALDA_ALTA' | 'ESPALDA_MEDIA' | 'ESPALDA_BAJA' | 'CADERA' | 'MUSLO' | 'RODILLA' | 'PIERNA' | 'TOBILLO' | 'PIE';
export type VistaCorporal = 'FRONTAL' | 'POSTERIOR' | 'LATERAL_DERECHA' | 'LATERAL_IZQUIERDA';