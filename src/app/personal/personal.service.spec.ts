import { PersonalService } from './personal.service';

describe('PersonalService', () => {
  it('adds, edits, and deactivates staff in its signal', () => {
    const service = new PersonalService();
    const agregado = service.agregar({ nombre: '  Elena Soto  ', avatarUrl: '' });
    const mesero = agregado().find((item) => item.nombre === 'Elena Soto');

    expect(mesero?.activo).toBe(true);
    expect(mesero).toBeDefined();
    if (!mesero) {
      return;
    }

    service.editar(mesero.id, { nombre: 'Elena Díaz', avatarUrl: '' });
    expect(service.meseros().find((item) => item.id === mesero.id)?.nombre).toBe('Elena Díaz');

    service.desactivar(mesero.id);
    expect(service.meseros().find((item) => item.id === mesero.id)?.activo).toBe(false);
  });
});
