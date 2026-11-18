import { computed, Injectable, Signal, signal } from '@angular/core';
import { Cliente, DatosCliente } from './clientes.models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly estadoClientes = signal<Cliente[]>([
    { id: 'cliente-mariana', nombre: 'Mariana López', telefono: '55 1234 5678' },
    { id: 'cliente-jorge', nombre: 'Jorge Mendoza', telefono: '55 2345 6789' },
    { id: 'cliente-sofia', nombre: 'Sofía Herrera', telefono: '55 3456 7890' },
    { id: 'cliente-diego', nombre: 'Diego Navarro', telefono: '55 4567 8901' },
    { id: 'cliente-elena', nombre: 'Elena Ramírez', telefono: '55 5678 9012' },
    { id: 'cliente-raul', nombre: 'Raúl Castillo', telefono: '55 6789 0123' },
  ]);
  readonly clientes: Signal<Cliente[]> = this.estadoClientes.asReadonly();
  private siguienteId = 1;

  buscar(consulta: string): Signal<Cliente[]> {
    return computed(() => {
      const termino = consulta.trim().toLocaleLowerCase('es-MX');
      const telefono = termino.replace(/\D/g, '');

      if (!termino) {
        return [];
      }

      return this.estadoClientes()
        .filter(
          (cliente) =>
            cliente.nombre.toLocaleLowerCase('es-MX').includes(termino) ||
            cliente.telefono.toLocaleLowerCase('es-MX').includes(termino) ||
            (telefono.length > 0 && cliente.telefono.replace(/\D/g, '').includes(telefono)),
        )
        .map((cliente) => ({ ...cliente }));
    });
  }

  obtenerPorId(id: string): Signal<Cliente | undefined> {
    return computed(() => {
      const cliente = this.estadoClientes().find((item) => item.id === id);
      return cliente ? { ...cliente } : undefined;
    });
  }

  obtenerPorTelefono(telefono: string): Signal<Cliente | undefined> {
    const numero = telefono.replace(/\D/g, '');
    return computed(() => {
      const cliente = this.estadoClientes().find(
        (item) => item.telefono.replace(/\D/g, '') === numero,
      );
      return cliente ? { ...cliente } : undefined;
    });
  }

  agregar(datos: DatosCliente): Signal<Cliente[]> {
    const normalizados = this.normalizarDatos(datos);
    const telefonoExistente = this.estadoClientes().find(
      (cliente) => cliente.telefono.replace(/\D/g, '') === normalizados.telefono.replace(/\D/g, ''),
    );

    if (telefonoExistente) {
      return this.clientes;
    }

    const cliente: Cliente = {
      ...normalizados,
      id: `cliente-nuevo-${this.siguienteId}`,
    };
    this.siguienteId += 1;
    this.estadoClientes.update((clientes) => [...clientes, cliente]);
    return this.clientes;
  }

  private normalizarDatos(datos: DatosCliente): DatosCliente {
    const nombre = datos.nombre.trim();
    const telefono = datos.telefono.trim();

    if (!nombre || !telefono) {
      throw new Error('El nombre y el teléfono del cliente son obligatorios.');
    }

    return { nombre, telefono };
  }
}
