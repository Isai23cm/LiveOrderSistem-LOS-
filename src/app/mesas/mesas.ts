import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientesService } from '../clientes/clientes.service';
import { Cliente } from '../clientes/clientes.models';
import { PersonalService } from '../personal/personal.service';
import { EstadoMesa, Mesa, PedidoResumen, Reservacion, ZonaMesa } from './mesas.models';
import { MesasService } from './mesas.service';

type FiltroZona = 'todas' | ZonaMesa;

@Component({
  selector: 'app-mesas',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './mesas.html',
})
export class Mesas {
  private readonly mesasService = inject(MesasService);
  private readonly personalService = inject(PersonalService);
  private readonly clientesService = inject(ClientesService);

  protected readonly mesas = this.mesasService.mesas;
  protected readonly meseros = computed(() =>
    this.personalService.meseros().filter((mesero) => mesero.activo),
  );
  protected readonly filtroZona = signal<FiltroZona>('todas');
  private readonly mesaSeleccionadaId = signal<string | null>(null);
  protected readonly mesaSeleccionada = computed(
    () => this.mesas().find((mesa) => mesa.id === this.mesaSeleccionadaId()) ?? null,
  );
  protected readonly pedidoSeleccionado = signal<PedidoResumen | null>(null);
  protected readonly meseroIdSeleccionado = signal('');
  protected readonly mensajeGuardado = signal('');
  protected readonly consultaCliente = signal('');
  protected readonly mostrarListaClientes = signal(false);
  protected readonly clientesCoincidentes = computed(() =>
    this.clientesService.buscar(this.consultaCliente())(),
  );
  protected readonly mesasFiltradas = computed(() =>
    this.mesas().filter((mesa) => this.filtroZona() === 'todas' || mesa.zona === this.filtroZona()),
  );
  protected readonly mesasActivas = computed(
    () => this.mesas().filter((mesa) => mesa.estado === 'ocupada').length,
  );
  protected readonly mesasOcupadas = this.mesasActivas;
  protected readonly opcionesZona: { id: FiltroZona; etiqueta: string }[] = [
    { id: 'todas', etiqueta: 'Todas' },
    { id: 'salon', etiqueta: 'Salón principal' },
    { id: 'terraza', etiqueta: 'Terraza' },
    { id: 'barra', etiqueta: 'Barra' },
  ];
  protected readonly reservacionForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cliente: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    personas: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    fechaHora: new FormControl(this.fechaSugerida(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notas: new FormControl('', { nonNullable: true }),
  });

  protected seleccionarZona(zona: FiltroZona): void {
    this.filtroZona.set(zona);
  }

  protected nuevaReservacion(): void {
    const mesaDisponible = this.mesas().find((mesa) => mesa.estado === 'disponible');
    if (!mesaDisponible) {
      this.mensajeGuardado.set('No hay mesas disponibles para reservar.');
      return;
    }

    this.filtroZona.set('todas');
    this.seleccionarMesa(mesaDisponible);
  }

  protected seleccionarMesa(mesa: Mesa): void {
    this.mesaSeleccionadaId.set(mesa.id);
    this.pedidoSeleccionado.set(null);
    this.meseroIdSeleccionado.set(mesa.meseroId ?? '');
    const reservacion = this.mesasService.obtenerReservacion(mesa.id)();
    this.reservacionForm.reset(
      reservacion
        ? {
            clienteId: reservacion.clienteId,
            cliente: reservacion.cliente,
            telefono: reservacion.telefono,
            personas: reservacion.personas,
            fechaHora: reservacion.fechaHora,
            notas: reservacion.notas,
          }
        : {
            clienteId: '',
            cliente: '',
            telefono: '',
            personas: mesa.capacidad,
            fechaHora: this.fechaSugerida(),
            notas: '',
          },
    );
    this.consultaCliente.set(reservacion?.cliente ?? '');
    this.mostrarListaClientes.set(false);
    this.mensajeGuardado.set('');
  }

  protected actualizarConsultaCliente(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.consultaCliente.set(event.target.value);
      this.reservacionForm.controls.clienteId.setValue('');
      this.reservacionForm.controls.telefono.setValue('');
      this.mostrarListaClientes.set(true);
    }
  }

  protected editarTelefonoCliente(): void {
    this.reservacionForm.controls.clienteId.setValue('');
  }

  protected seleccionarCliente(cliente: Cliente): void {
    this.reservacionForm.patchValue({
      clienteId: cliente.id,
      cliente: cliente.nombre,
      telefono: cliente.telefono,
    });
    this.consultaCliente.set(cliente.nombre);
    this.mostrarListaClientes.set(false);
  }

  protected crearClienteNuevo(): void {
    const nombre = this.reservacionForm.controls.cliente.value;
    const telefono = this.reservacionForm.controls.telefono.value;

    if (!nombre.trim() || !telefono.trim()) {
      this.reservacionForm.controls.cliente.markAsTouched();
      this.reservacionForm.controls.telefono.markAsTouched();
      return;
    }

    this.clientesService.agregar({ nombre, telefono });
    const cliente = this.clientesService.obtenerPorTelefono(telefono)();
    if (!cliente) {
      throw new Error('No se pudo recuperar el cliente recién agregado.');
    }

    this.seleccionarCliente(cliente);
  }

  protected guardarReservacion(): void {
    const mesa = this.mesaSeleccionada();
    if (!mesa || this.reservacionForm.invalid) {
      this.reservacionForm.markAllAsTouched();
      return;
    }

    const datos = this.reservacionForm.getRawValue();
    const reservacion: Reservacion = {
      id: '',
      mesaId: mesa.id,
      clienteId: datos.clienteId,
      cliente: datos.cliente.trim(),
      telefono: datos.telefono.trim(),
      personas: datos.personas,
      fechaHora: datos.fechaHora,
      notas: datos.notas.trim(),
    };
    this.mesasService.guardarReservacion(reservacion);
    this.mensajeGuardado.set('Reservación guardada correctamente.');
  }

  protected asignarMesero(): void {
    const mesa = this.mesaSeleccionada();
    const meseroId = this.meseroIdSeleccionado();
    if (!mesa || !meseroId || !this.meseros().some((mesero) => mesero.id === meseroId)) {
      return;
    }

    this.mesasService.asignarMesero(mesa.id, meseroId);
    this.mensajeGuardado.set('Mesero asignado correctamente.');
  }

  protected meseroAsignadoInactivo(mesa: Mesa): boolean {
    return Boolean(mesa.meseroId && !this.meseros().some((mesero) => mesero.id === mesa.meseroId));
  }

  protected seleccionarMesero(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.meseroIdSeleccionado.set(event.target.value);
    }
  }

  protected cambiarEstado(): void {
    const mesa = this.mesaSeleccionada();
    if (mesa) {
      this.mesasService.cambiarEstadoMesa(mesa.id);
    }
  }

  protected liberarMesa(): void {
    const mesa = this.mesaSeleccionada();
    if (mesa) {
      this.mesasService.liberarMesa(mesa.id);
      this.pedidoSeleccionado.set(null);
      this.seleccionarMesa({
        ...mesa,
        estado: 'disponible',
        pedidoId: undefined,
        meseroId: undefined,
        horaReservacion: undefined,
        minutosOcupada: undefined,
      });
      this.mensajeGuardado.set('La mesa quedó disponible.');
    }
  }

  protected abrirPedido(): void {
    const mesa = this.mesaSeleccionada();
    if (!mesa) {
      return;
    }

    if (!mesa.pedidoId) {
      this.mesasService.vincularPedido(mesa.id);
    }

    const mesaActualizada = this.mesas().find((item) => item.id === mesa.id);
    if (!mesaActualizada) {
      throw new Error(`No se pudo actualizar la mesa "${mesa.id}".`);
    }

    this.pedidoSeleccionado.set(
      mesaActualizada.pedidoId
        ? (this.mesasService.obtenerPedido(mesaActualizada.pedidoId)() ?? null)
        : null,
    );
  }

  protected pedidoPara(mesa: Mesa): PedidoResumen | undefined {
    return mesa.pedidoId ? this.mesasService.obtenerPedido(mesa.pedidoId)() : undefined;
  }

  protected nombreZona(zona: ZonaMesa): string {
    const nombres: Record<ZonaMesa, string> = {
      salon: 'Salón principal',
      terraza: 'Terraza',
      barra: 'Barra',
    };
    return nombres[zona];
  }

  protected textoEstado(estado: EstadoMesa): string {
    const nombres: Record<EstadoMesa, string> = {
      disponible: 'Disponible',
      ocupada: 'Ocupada',
      reservada: 'Reservada',
    };
    return nombres[estado];
  }

  protected horaVisible(hora?: string): string {
    if (!hora) {
      return '';
    }
    const [horaTexto = '0', minutos = '00'] = hora.split(':');
    const horaNumero = Number(horaTexto);
    return `${horaNumero % 12 || 12}:${minutos} ${horaNumero >= 12 ? 'PM' : 'AM'}`;
  }

  protected iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((parte) => parte[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  protected estadoSiguiente(estado: EstadoMesa): string {
    const nombres: Record<EstadoMesa, string> = {
      disponible: 'ocupada',
      ocupada: 'reservada',
      reservada: 'disponible',
    };
    return nombres[estado];
  }

  private fechaSugerida(): string {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().slice(0, 16);
  }
}
