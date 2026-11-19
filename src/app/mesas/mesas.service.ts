import { computed, Injectable, Signal, inject, signal } from '@angular/core';
import { ClientesService } from '../clientes/clientes.service';
import { PersonalService } from '../personal/personal.service';
import { EstadoMesa, Mesa, PedidoResumen, Reservacion, ZonaMesa } from './mesas.models';

@Injectable({ providedIn: 'root' })
export class MesasService {
  private readonly clientesService = inject(ClientesService);
  private readonly personalService = inject(PersonalService);
  private readonly estadoMesas = signal(this.crearMesasMock());
  private readonly estadoReservaciones = signal<Reservacion[]>([
    {
      id: 'res-015',
      mesaId: 'mesa-15',
      clienteId: 'cliente-mariana',
      cliente: 'Mariana López',
      telefono: '55 1234 5678',
      personas: 4,
      fechaHora: '2026-11-17T18:30',
      notas: 'Celebración de aniversario',
    },
    {
      id: 'res-018',
      mesaId: 'mesa-18',
      clienteId: 'cliente-jorge',
      cliente: 'Jorge Mendoza',
      telefono: '55 2345 6789',
      personas: 2,
      fechaHora: '2026-11-17T19:00',
      notas: 'Prefiere mesa junto a la ventana',
    },
    {
      id: 'res-023',
      mesaId: 'mesa-23',
      clienteId: 'cliente-sofia',
      cliente: 'Sofía Herrera',
      telefono: '55 3456 7890',
      personas: 5,
      fechaHora: '2026-11-17T19:30',
      notas: '',
    },
    {
      id: 'res-027',
      mesaId: 'mesa-27',
      clienteId: 'cliente-diego',
      cliente: 'Diego Navarro',
      telefono: '55 4567 8901',
      personas: 3,
      fechaHora: '2026-11-17T20:00',
      notas: 'Silla alta para bebé',
    },
  ]);
  readonly mesas: Signal<Mesa[]> = this.estadoMesas.asReadonly();
  readonly reservaciones: Signal<Reservacion[]> = this.estadoReservaciones.asReadonly();
  private readonly estadoPedidos = signal<PedidoResumen[]>([
    {
      id: 'pedido-1048',
      folio: '#1048',
      articulos: ['2 hamburguesas clásicas', 'Papas trufadas', '2 limonadas'],
      total: 684,
      estado: 'En preparación',
    },
    {
      id: 'pedido-1039',
      folio: '#1039',
      articulos: ['Pizza margarita', 'Ensalada de la casa', 'Agua mineral'],
      total: 512,
      estado: 'Listo para cobrar',
    },
    {
      id: 'pedido-1042',
      folio: '#1042',
      articulos: ['Pasta al pesto', 'Pan de ajo', '2 cafés americanos'],
      total: 438,
      estado: 'En preparación',
    },
  ]);
  readonly pedidos: Signal<PedidoResumen[]> = this.estadoPedidos.asReadonly();
  private siguienteFolio = 1055;
  private siguienteReservacionId = 1;

  obtenerReservacion(mesaId: string): Signal<Reservacion | undefined> {
    return computed(() => {
      const reservacion = this.estadoReservaciones().find((item) => item.mesaId === mesaId);
      return reservacion ? { ...reservacion } : undefined;
    });
  }

  obtenerPedido(pedidoId: string): Signal<PedidoResumen | undefined> {
    return computed(() => {
      const pedido = this.estadoPedidos().find((item) => item.id === pedidoId);
      return pedido ? { ...pedido, articulos: [...pedido.articulos] } : undefined;
    });
  }

  guardarReservacion(reservacion: Reservacion): Signal<Mesa[]> {
    const mesa = this.buscarMesa(reservacion.mesaId);
    const cliente = this.clientesService.obtenerPorId(reservacion.clienteId)();

    if (!cliente) {
      throw new Error(`No se encontró el cliente "${reservacion.clienteId}".`);
    }

    const existente = this.estadoReservaciones().find((item) => item.mesaId === reservacion.mesaId);
    const guardada: Reservacion = {
      ...reservacion,
      id: existente?.id ?? `res-nueva-${this.siguienteReservacionId}`,
      cliente: cliente.nombre,
      telefono: cliente.telefono,
    };
    if (!existente) {
      this.siguienteReservacionId += 1;
    }
    this.estadoReservaciones.update((reservaciones) => [
      ...reservaciones.filter((item) => item.mesaId !== reservacion.mesaId),
      guardada,
    ]);

    this.actualizarMesa(mesa.id, {
      estado: 'reservada',
      horaReservacion: guardada.fechaHora.split('T')[1] ?? '18:00',
    });
    return this.mesas;
  }

  asignarMesero(mesaId: string, meseroId: string): Signal<Mesa[]> {
    const mesero = this.personalService
      .meseros()
      .find((item) => item.id === meseroId && item.activo);
    if (!mesero) {
      throw new Error(`No se encontró un mesero activo con identificador "${meseroId}".`);
    }

    this.actualizarMesa(mesaId, { meseroId });
    return this.mesas;
  }

  cambiarEstadoMesa(mesaId: string): Signal<Mesa[]> {
    const mesa = this.buscarMesa(mesaId);
    const siguienteEstado: Record<EstadoMesa, EstadoMesa> = {
      disponible: 'ocupada',
      ocupada: 'reservada',
      reservada: 'disponible',
    };
    const estado = siguienteEstado[mesa.estado];

    this.actualizarMesa(mesaId, {
      estado,
      minutosOcupada: estado === 'ocupada' ? 0 : undefined,
      horaReservacion: estado === 'reservada' ? '19:00' : undefined,
    });

    if (estado === 'disponible') {
      this.eliminarReservacion(mesaId);
    }

    return this.mesas;
  }

  liberarMesa(mesaId: string): Signal<Mesa[]> {
    this.actualizarMesa(mesaId, {
      estado: 'disponible',
      minutosOcupada: undefined,
      horaReservacion: undefined,
      meseroId: undefined,
      pedidoId: undefined,
    });
    this.eliminarReservacion(mesaId);
    return this.mesas;
  }

  vincularPedido(mesaId: string): Signal<Mesa[]> {
    const mesa = this.buscarMesa(mesaId);

    if (mesa.pedidoId) {
      return this.mesas;
    }

    const id = `pedido-${this.siguienteFolio}`;
    const pedido: PedidoResumen = {
      id,
      folio: `#${this.siguienteFolio}`,
      articulos: ['Hamburguesa clásica', 'Papas de la casa', 'Limonada natural'],
      total: 426,
      estado: 'En preparación',
    };
    this.estadoPedidos.update((pedidos) => [...pedidos, pedido]);
    this.siguienteFolio += 1;

    this.actualizarMesa(mesaId, { estado: 'ocupada', pedidoId: id, minutosOcupada: 0 });
    return this.mesas;
  }

  private buscarMesa(mesaId: string): Mesa {
    const mesa = this.estadoMesas().find((item) => item.id === mesaId);

    if (!mesa) {
      throw new Error(`No se encontró la mesa "${mesaId}".`);
    }

    return mesa;
  }

  private actualizarMesa(mesaId: string, cambios: Partial<Mesa>): Mesa {
    const mesa = this.buscarMesa(mesaId);
    const actualizada = { ...mesa, ...cambios };
    this.estadoMesas.update((mesas) =>
      mesas.map((item) => (item.id === mesaId ? actualizada : item)),
    );
    return { ...actualizada };
  }

  private eliminarReservacion(mesaId: string): void {
    this.estadoReservaciones.update((reservaciones) =>
      reservaciones.filter((reservacion) => reservacion.mesaId !== mesaId),
    );
  }

  private crearMesasMock(): Mesa[] {
    const salon: Mesa[] = [];
    const posicionesSalon = [
      [10, 25],
      [28, 25],
      [46, 25],
      [64, 25],
      [10, 49],
      [28, 49],
      [46, 49],
      [64, 49],
      [10, 73],
      [28, 73],
      [46, 73],
      [64, 73],
    ];
    const posicionesTerraza = [
      [76, 20],
      [91, 20],
      [76, 39],
      [91, 39],
      [76, 58],
      [91, 58],
      [76, 76],
      [91, 76],
    ];
    const posicionesBarra = [
      [20, 91],
      [28, 91],
      [36, 91],
      [44, 91],
      [52, 91],
      [60, 91],
      [68, 91],
      [76, 91],
    ];
    const posiciones: { zona: ZonaMesa; x: number; y: number }[] = [
      ...posicionesSalon.map(([x, y]) => ({ zona: 'salon' as const, x, y })),
      ...posicionesTerraza.map(([x, y]) => ({ zona: 'terraza' as const, x, y })),
      ...posicionesBarra.map(([x, y]) => ({ zona: 'barra' as const, x, y })),
    ];

    for (let numero = 1; numero <= 28; numero += 1) {
      const posicion = posiciones[numero - 1];
      const estado: EstadoMesa =
        numero <= 14 ? 'ocupada' : [15, 18, 23, 27].includes(numero) ? 'reservada' : 'disponible';

      salon.push({
        id: `mesa-${String(numero).padStart(2, '0')}`,
        numero,
        zona: posicion.zona,
        capacidad: numero % 7 === 0 ? 6 : numero % 3 === 0 ? 2 : 4,
        estado,
        x: posicion.x,
        y: posicion.y,
        forma: numero % 2 === 0 ? 'cuadrada' : 'redonda',
        ...(estado === 'ocupada' ? { minutosOcupada: 18 + ((numero * 7) % 46) } : {}),
        ...(estado === 'reservada'
          ? {
              horaReservacion: (
                { 15: '18:30', 18: '19:00', 23: '19:30', 27: '20:00' } as Record<number, string>
              )[numero],
            }
          : {}),
        ...(estado === 'ocupada'
          ? { meseroId: `mesero-${['ana', 'carlos', 'lucia', 'miguel', 'valeria'][numero % 5]}` }
          : {}),
        ...(numero === 6 ? { pedidoId: 'pedido-1048' } : {}),
        ...(numero === 3 ? { pedidoId: 'pedido-1039' } : {}),
        ...(numero === 11 ? { pedidoId: 'pedido-1042' } : {}),
      });
    }

    return salon;
  }
}
