import { Injectable, Signal, signal } from '@angular/core';
import { DatosMesero, Mesero } from './personal.models';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private readonly estadoMeseros = signal<Mesero[]>([
    { id: 'mesero-ana', nombre: 'Ana García', activo: true, avatarUrl: '' },
    { id: 'mesero-carlos', nombre: 'Carlos Ruiz', activo: true, avatarUrl: '' },
    { id: 'mesero-lucia', nombre: 'Lucía Torres', activo: true, avatarUrl: '' },
    { id: 'mesero-miguel', nombre: 'Miguel Santos', activo: true, avatarUrl: '' },
    { id: 'mesero-valeria', nombre: 'Valeria Cruz', activo: true, avatarUrl: '' },
  ]);
  readonly meseros: Signal<Mesero[]> = this.estadoMeseros.asReadonly();
  private siguienteId = 1;

  agregar(datos: DatosMesero): Signal<Mesero[]> {
    const mesero: Mesero = {
      ...this.normalizarDatos(datos),
      id: `mesero-nuevo-${this.siguienteId}`,
      activo: true,
    };
    this.siguienteId += 1;
    this.estadoMeseros.update((meseros) => [...meseros, mesero]);
    return this.meseros;
  }

  editar(id: string, datos: DatosMesero): Signal<Mesero[]> {
    const actualizados = this.normalizarDatos(datos);
    const mesero = this.estadoMeseros().find((item) => item.id === id);

    if (!mesero) {
      throw new Error(`No se encontró el mesero "${id}".`);
    }

    const actualizado = { ...mesero, ...actualizados };
    this.estadoMeseros.update((meseros) =>
      meseros.map((item) => (item.id === id ? actualizado : item)),
    );
    return this.meseros;
  }

  desactivar(id: string): Signal<Mesero[]> {
    const mesero = this.estadoMeseros().find((item) => item.id === id);

    if (!mesero) {
      throw new Error(`No se encontró el mesero "${id}".`);
    }

    const desactivado = { ...mesero, activo: false };
    this.estadoMeseros.update((meseros) =>
      meseros.map((item) => (item.id === id ? desactivado : item)),
    );
    return this.meseros;
  }

  private normalizarDatos(datos: DatosMesero): DatosMesero {
    const nombre = datos.nombre.trim();

    if (!nombre) {
      throw new Error('El nombre del mesero es obligatorio.');
    }

    return { nombre, avatarUrl: datos.avatarUrl.trim() };
  }
}
