import '@angular/compiler';
import { Injector } from '@angular/core';
import { ClientesService } from '../clientes/clientes.service';
import { PersonalService } from '../personal/personal.service';
import { MesasService } from './mesas.service';

describe('MesasService', () => {
  it('updates mesa and reservation signals using client and active staff ids', () => {
    const injector = Injector.create({
      providers: [ClientesService, PersonalService, MesasService],
    });
    const mesasService = injector.get(MesasService);
    const personalService = injector.get(PersonalService);

    expect(mesasService.mesas().length).toBe(28);
    expect(mesasService.mesas().filter((mesa) => mesa.estado === 'ocupada').length).toBe(14);

    mesasService.guardarReservacion({
      id: '',
      mesaId: 'mesa-16',
      clienteId: 'cliente-mariana',
      cliente: '',
      telefono: '',
      personas: 2,
      fechaHora: '2026-11-17T19:00',
      notas: '',
    });
    expect(mesasService.obtenerReservacion('mesa-16')()?.clienteId).toBe('cliente-mariana');
    expect(mesasService.mesas().find((mesa) => mesa.id === 'mesa-16')?.estado).toBe('reservada');

    mesasService.asignarMesero('mesa-16', 'mesero-ana');
    expect(mesasService.mesas().find((mesa) => mesa.id === 'mesa-16')?.meseroId).toBe('mesero-ana');

    personalService.desactivar('mesero-ana');
    expect(() => mesasService.asignarMesero('mesa-16', 'mesero-ana')).toThrow();
    injector.destroy();
  });
});
