import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { App } from './app';
import { ClientesService } from './clientes/clientes.service';
import { MesasService } from './mesas/mesas.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('bistroos-theme');
    localStorage.removeItem('bistroos-payments');
    localStorage.setItem(
      'bistroos-session',
      JSON.stringify({ email: 'admin@bistroos.com', name: 'Administrador' }),
    );
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestión del menú');
  });

  it('should navigate to the restaurant table map', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Mesas"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.querySelector('.mesas-screen h1')?.textContent).toContain('Mapa de mesas');
    expect(host.querySelectorAll('.table-pin').length).toBe(28);
    expect(host.textContent).toContain('14/28');
  });

  it('should navigate to the staff management screen', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Personal"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.querySelector('.personal-screen h1')?.textContent).toContain('Personal');
    expect(host.querySelectorAll('.staff-table tbody tr').length).toBe(5);
  });

  it('should create a client and save its id on a table reservation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Mesas"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    host.querySelector<HTMLButtonElement>('.heading-actions .primary-button')?.click();
    fixture.detectChanges();

    const nombre = host.querySelector<HTMLInputElement>('#cliente-reservacion');
    expect(nombre).toBeTruthy();
    if (!nombre) {
      return;
    }

    nombre.value = 'Cliente de prueba';
    nombre.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const telefono = host.querySelector<HTMLInputElement>('.field-row input[type="tel"]');
    expect(telefono).toBeTruthy();
    if (!telefono) {
      return;
    }

    telefono.value = '55 9876 5432';
    telefono.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    host.querySelector<HTMLButtonElement>('.client-empty .text-button')?.click();
    fixture.detectChanges();
    host.querySelector<HTMLButtonElement>('.save-reservation')?.click();
    fixture.detectChanges();

    const cliente = TestBed.inject(ClientesService).obtenerPorTelefono('55 9876 5432')();
    const reservacion = TestBed.inject(MesasService).obtenerReservacion('mesa-16')();
    expect(cliente?.nombre).toBe('Cliente de prueba');
    expect(reservacion?.clienteId).toBe(cliente?.id);
    expect(reservacion?.telefono).toBe('55 9876 5432');
  });

  it('should toggle and persist the color theme', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.app-shell')?.getAttribute('data-theme')).toBe('light');

    host.querySelector<HTMLButtonElement>('.theme-toggle')?.click();
    fixture.detectChanges();

    expect(host.querySelector('.app-shell')?.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('bistroos-theme')).toBe('dark');
    expect(host.querySelector('.theme-toggle')?.getAttribute('aria-label')).toBe(
      'Activar modo claro',
    );

    fixture.destroy();
    const restoredFixture = TestBed.createComponent(App);
    await restoredFixture.whenStable();
    restoredFixture.detectChanges();

    expect(
      (restoredFixture.nativeElement as HTMLElement)
        .querySelector('.app-shell')
        ?.getAttribute('data-theme'),
    ).toBe('dark');
  });

  it('should filter menu items by category', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const categoryTab = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.category-tab'),
    ).find((button) => button.textContent?.trim() === 'Pizzas');

    categoryTab?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.product-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.product-card h3')?.textContent).toContain(
      'Pizza margarita',
    );
  });

  it('should toggle an item availability switch', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const availabilitySwitch = host.querySelector<HTMLButtonElement>('[role="switch"]');
    expect(availabilitySwitch?.getAttribute('aria-checked')).toBe('true');

    availabilitySwitch?.click();
    fixture.detectChanges();

    expect(availabilitySwitch?.getAttribute('aria-checked')).toBe('false');
  });

  it('should open the add item dialog', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('.page-heading .primary-button')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#modal-title')?.textContent).toContain(
      'Agregar platillo nuevo',
    );
  });

  it('should open checkout from Orders and calculate the selected tip', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Pedidos"]')?.click();
    fixture.detectChanges();

    expect(host.querySelector('h1')?.textContent).toContain('Pago y liquidación');
    expect(host.textContent).toContain('$56.33');

    const tenPercent = Array.from(host.querySelectorAll<HTMLButtonElement>('.tip-option')).find(
      (button) => button.textContent?.trim() === '10%',
    );
    tenPercent?.click();
    fixture.detectChanges();

    expect(host.textContent).toContain('$54.18');
  });

  it('should complete a payment entered with the keypad', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Pedidos"]')?.click();
    fixture.detectChanges();
    host.querySelector<HTMLButtonElement>('[aria-label="2"]')?.click();
    fixture.detectChanges();

    const payButton = Array.from(host.querySelectorAll<HTMLButtonElement>('.pay-button')).find(
      (button) => button.textContent?.includes('$2.00'),
    );
    payButton?.click();
    fixture.detectChanges();

    expect(host.querySelector('[role="status"]')?.textContent).toContain('Pago registrado');
    expect(JSON.parse(localStorage.getItem('bistroos-payments') ?? '[]')).toHaveLength(8);
  });

  it('should open the payment history and filter transactions by status', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Historial de pagos"]')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.querySelector('#payment-history-title')?.textContent).toContain('Historial de pagos');
    expect(host.querySelectorAll('tbody tr').length).toBe(5);

    const statusFilter = host.querySelector<HTMLSelectElement>('#payment-status');
    expect(statusFilter).toBeTruthy();
    if (!statusFilter) {
      return;
    }

    statusFilter.value = 'refunded';
    statusFilter.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(host.querySelectorAll('tbody tr').length).toBe(1);
    expect(host.querySelector('tbody')?.textContent).toContain('Reembolsado');
  });

  it('should show all three live kitchen columns from Dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Cocina"]')?.click();
    fixture.detectChanges();

    expect(host.querySelector('h1')?.textContent).toContain('Pantalla de cocina');
    expect(host.querySelectorAll('.kds-column').length).toBe(3);
    expect(
      Array.from(host.querySelectorAll('.column-counter')).map((counter) =>
        counter.textContent?.trim(),
      ),
    ).toEqual(['3', '4', '2']);
    expect(host.querySelectorAll('.kds-ticket').length).toBe(9);
    expect(host.querySelector('.modifier-exclusion')?.textContent).toContain('Sin cebolla');
  });

  it('should move kitchen tickets through pending, preparing, ready, and bumped', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Cocina"]')?.click();
    fixture.detectChanges();

    host.querySelector<HTMLButtonElement>('[aria-label="Iniciar preparación pedido #204"]')?.click();
    fixture.detectChanges();
    expect(host.querySelectorAll('.pending-column .kds-ticket').length).toBe(2);
    expect(host.querySelectorAll('.preparing-column .kds-ticket').length).toBe(5);

    host.querySelector<HTMLButtonElement>('[aria-label="Marcar como listo pedido #204"]')?.click();
    fixture.detectChanges();
    expect(host.querySelectorAll('.preparing-column .kds-ticket').length).toBe(4);
    expect(host.querySelectorAll('.ready-column .kds-ticket').length).toBe(3);

    host.querySelector<HTMLButtonElement>('[aria-label="Despachar pedido #204"]')?.click();
    fixture.detectChanges();
    expect(host.querySelectorAll('.ready-column .kds-ticket').length).toBe(2);
    expect(host.querySelector('.kds-board-summary')?.textContent).toContain('8');
  });

  it('should filter the kitchen board to delayed tickets', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLButtonElement>('[aria-label="Cocina"]')?.click();
    fixture.detectChanges();
    host.querySelector<HTMLButtonElement>('[aria-label="Filtrar pedidos de cocina"]')?.click();
    fixture.detectChanges();
    Array.from(host.querySelectorAll<HTMLButtonElement>('.kds-filter-menu button'))
      .find((button) => button.textContent?.trim() === 'Solo atrasados')
      ?.click();
    fixture.detectChanges();

    expect(host.querySelectorAll('.kds-ticket').length).toBe(2);
    expect(host.querySelectorAll('.delay-alert').length).toBe(2);
  });
});
