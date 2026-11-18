export type ZonaMesa = 'salon' | 'terraza' | 'barra';
export type EstadoMesa = 'disponible' | 'ocupada' | 'reservada';
export type { Mesero } from '../personal/personal.models';

export interface Mesa {
  id: string;
  numero: number;
  zona: ZonaMesa;
  capacidad: number;
  estado: EstadoMesa;
  x: number;
  y: number;
  forma: 'redonda' | 'cuadrada';
  minutosOcupada?: number;
  horaReservacion?: string;
  meseroId?: string;
  pedidoId?: string;
}

export interface Reservacion {
  id: string;
  mesaId: string;
  clienteId: string;
  cliente: string;
  telefono: string;
  personas: number;
  fechaHora: string;
  notas: string;
}

export interface PedidoResumen {
  id: string;
  folio: string;
  articulos: string[];
  total: number;
  estado: string;
}
