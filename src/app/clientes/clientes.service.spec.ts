import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  it('searches by name or phone and creates a customer in its signal', () => {
    const service = new ClientesService();

    expect(
      service
        .buscar('Mariana')()
        .map((cliente) => cliente.id),
    ).toContain('cliente-mariana');
    expect(
      service
        .buscar('1234 5678')()
        .map((cliente) => cliente.id),
    ).toContain('cliente-mariana');

    const clientes = service.agregar({ nombre: '  Eva Ríos ', telefono: '55 1111 2222' });
    expect(clientes().some((cliente) => cliente.nombre === 'Eva Ríos')).toBe(true);
    expect(service.obtenerPorTelefono('55-1111-2222')()?.nombre).toBe('Eva Ríos');
  });
});
