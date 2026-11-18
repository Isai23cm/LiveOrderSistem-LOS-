import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';
import { interval, map, startWith } from 'rxjs';

type MenuCategory = 'Hamburguesas' | 'Pizzas' | 'Acompañamientos' | 'Bebidas' | 'Postres';
type AppTheme = 'light' | 'dark';
type PaymentMethodId = 'cash' | 'card' | 'nfc' | 'wallet';
type KitchenStatus = 'pending' | 'preparing' | 'ready';
type KitchenFilter = 'all' | 'delayed' | 'dine-in' | 'delivery';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
  available: boolean;
}

interface MenuItemDraft {
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
}

interface OrderLine {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface KitchenOrderItem {
  quantity: number;
  name: string;
  additions?: string[];
  exclusions?: string[];
  note?: string;
}

interface KitchenOrder {
  id: number;
  number: number;
  status: KitchenStatus;
  service: 'En mesa' | 'A domicilio';
  table?: string;
  elapsedMinutes: number;
  items: KitchenOrderItem[];
}

@Component({
  imports: [AsyncPipe, FormsModule, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected activeScreen: 'menu' | 'checkout' | 'kds' = 'menu';
  protected theme: AppTheme =
    localStorage.getItem('bistroos-theme') === 'dark' ? 'dark' : 'light';
  protected readonly clockDisplay$ = interval(1000).pipe(
    startWith(0),
    map(() =>
      new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      }),
    ),
  );

  protected readonly categories = [
    'Todos',
    'Hamburguesas',
    'Pizzas',
    'Acompañamientos',
    'Bebidas',
    'Postres',
  ] as const;

  protected readonly navigation = [
    { label: 'Cocina', icon: 'dashboard' },
    { label: 'Pedidos', icon: 'orders' },
    { label: 'Mesas', icon: 'tables' },
    { label: 'Personal', icon: 'staff' },
    { label: 'Menú', icon: 'menu' },
    { label: 'Clientes', icon: 'customers' },
    { label: 'Analítica', icon: 'analytics' },
  ];

  protected readonly kitchenColumns: {
    status: KitchenStatus;
    label: string;
  }[] = [
    { status: 'pending', label: 'Pendientes' },
    { status: 'preparing', label: 'En preparación' },
    { status: 'ready', label: 'Listos' },
  ];

  protected readonly kitchenFilterOptions: {
    id: KitchenFilter;
    label: string;
  }[] = [
    { id: 'all', label: 'Todos los pedidos' },
    { id: 'delayed', label: 'Solo atrasados' },
    { id: 'dine-in', label: 'En mesa' },
    { id: 'delivery', label: 'A domicilio' },
  ];

  protected readonly kitchenOrders: KitchenOrder[] = [
    {
      id: 204,
      number: 204,
      status: 'pending',
      service: 'En mesa',
      table: '4',
      elapsedMinutes: 12,
      items: [
        {
          quantity: 1,
          name: 'Hamburguesa clásica',
          additions: ['Queso cheddar'],
          exclusions: ['Sin cebolla'],
          note: 'Término medio rojo',
        },
        { quantity: 1, name: 'Papas trufadas' },
      ],
    },
    {
      id: 205,
      number: 205,
      status: 'pending',
      service: 'A domicilio',
      elapsedMinutes: 6,
      items: [
        {
          quantity: 2,
          name: 'Hamburguesa doble con queso',
          additions: ['Pepinillos extra'],
        },
        { quantity: 1, name: 'Té helado artesanal' },
      ],
    },
    {
      id: 206,
      number: 206,
      status: 'pending',
      service: 'En mesa',
      table: '2',
      elapsedMinutes: 3,
      items: [{ quantity: 1, name: 'Pizza margarita', note: 'Bien cocida' }],
    },
    {
      id: 207,
      number: 207,
      status: 'preparing',
      service: 'En mesa',
      table: '8',
      elapsedMinutes: 9,
      items: [
        {
          quantity: 1,
          name: 'Hamburguesa BBQ con tocino',
          additions: ['Salsa BBQ extra'],
          exclusions: ['Sin pepinillos'],
          note: 'Bien cocida',
        },
      ],
    },
    {
      id: 208,
      number: 208,
      status: 'preparing',
      service: 'A domicilio',
      elapsedMinutes: 7,
      items: [
        { quantity: 1, name: 'Hamburguesa de champiñones y queso suizo', additions: ['Queso suizo'] },
        { quantity: 1, name: 'Papas trufadas', exclusions: ['Sin parmesano'] },
      ],
    },
    {
      id: 209,
      number: 209,
      status: 'preparing',
      service: 'En mesa',
      table: '1',
      elapsedMinutes: 5,
      items: [{ quantity: 2, name: 'Hamburguesa clásica', note: 'Término medio' }],
    },
    {
      id: 210,
      number: 210,
      status: 'preparing',
      service: 'A domicilio',
      elapsedMinutes: 14,
      items: [
        {
          quantity: 1,
          name: 'Hamburguesa doble con queso',
          exclusions: ['Sin cebolla'],
          note: 'Sin centro rosado',
        },
      ],
    },
    {
      id: 211,
      number: 211,
      status: 'ready',
      service: 'En mesa',
      table: '5',
      elapsedMinutes: 2,
      items: [
        { quantity: 1, name: 'Hamburguesa clásica', additions: ['Queso cheddar'] },
        { quantity: 1, name: 'Pastel de chocolate' },
      ],
    },
    {
      id: 212,
      number: 212,
      status: 'ready',
      service: 'A domicilio',
      elapsedMinutes: 4,
      items: [{ quantity: 2, name: 'Pizza margarita', note: 'Cortar antes de empacar' }],
    },
  ];

  protected kitchenSearchQuery = '';
  protected kitchenFilter: KitchenFilter = 'all';
  protected showKitchenFilters = false;

  protected readonly checkoutItems: OrderLine[] = [
    { id: 1, name: 'Hamburguesa clásica', quantity: 1, price: 14.5 },
    { id: 2, name: 'Papas trufadas', quantity: 1, price: 16 },
    { id: 3, name: 'Té helado artesanal', quantity: 1, price: 4.5 },
    { id: 4, name: 'Pastel de chocolate', quantity: 1, price: 8 },
  ];

  protected readonly paymentMethods: {
    id: PaymentMethodId;
    label: string;
    detail: string;
    icon: PaymentMethodId;
  }[] = [
    { id: 'cash', label: 'Efectivo', detail: 'Pago en persona', icon: 'cash' },
    { id: 'card', label: 'Tarjeta de crédito / débito', detail: 'Inserta, desliza o acerca', icon: 'card' },
    { id: 'nfc', label: 'Pago móvil', detail: 'Apple Pay, Google Pay', icon: 'nfc' },
    { id: 'wallet', label: 'Billetera digital', detail: 'Billetera en línea', icon: 'wallet' },
  ];

  protected readonly tipOptions: Array<number | 'Custom'> = [10, 15, 18, 20, 'Custom'];

  protected readonly items: MenuItem[] = [
    {
      id: 1,
      name: 'Hamburguesa doble con queso',
      price: 12.99,
      category: 'Hamburguesas',
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 2,
      name: 'Hamburguesa Smash clásica',
      price: 10.5,
      category: 'Hamburguesas',
      image:
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 3,
      name: 'Hamburguesa BBQ con tocino',
      price: 13.75,
      category: 'Hamburguesas',
      image:
        'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 4,
      name: 'Hamburguesa de champiñones y queso suizo',
      price: 12.25,
      category: 'Hamburguesas',
      image:
        'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=900&q=85',
      available: false,
    },
    {
      id: 5,
      name: 'Pizza margarita',
      price: 14.0,
      category: 'Pizzas',
      image:
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 6,
      name: 'Papas trufadas con parmesano',
      price: 7.5,
      category: 'Acompañamientos',
      image:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 7,
      name: 'Latte de vainilla helado',
      price: 5.25,
      category: 'Bebidas',
      image:
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85',
      available: true,
    },
    {
      id: 8,
      name: 'Pastel de chocolate',
      price: 8.0,
      category: 'Postres',
      image:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85',
      available: false,
    },
  ];

  protected activeCategory = 'Hamburguesas';
  protected searchQuery = '';
  protected isModalOpen = false;
  protected editingItemId: number | null = null;
  protected draft: MenuItemDraft = this.createEmptyDraft();
  protected selectedPaymentMethod: PaymentMethodId = 'card';
  protected selectedTip: number | 'Custom' = 15;
  protected customTipPercent = 15;
  protected paymentAmount = '56.33';
  protected keypadInputStarted = false;
  protected paymentAmountEdited = false;
  protected paymentComplete = false;
  protected receiptPrinted = false;

  protected get orderSubtotal(): number {
    return this.roundCurrency(
      this.checkoutItems.reduce((total, item) => total + item.quantity * item.price, 0),
    );
  }

  protected get orderTax(): number {
    return this.roundCurrency(this.orderSubtotal * 0.16);
  }

  protected get tipAmount(): number {
    const percentage =
      this.selectedTip === 'Custom' ? this.customTipPercent : this.selectedTip;

    return this.roundCurrency((this.orderSubtotal * percentage) / 100);
  }

  protected get totalDue(): number {
    return this.roundCurrency(this.orderSubtotal + this.orderTax + this.tipAmount);
  }

  protected get amountValue(): number {
    return Number(this.paymentAmount) || 0;
  }

  protected get activeKitchenOrderCount(): number {
    return this.kitchenOrders.length;
  }

  protected get selectedPaymentMethodLabel(): string {
    return (
      this.paymentMethods.find((method) => method.id === this.selectedPaymentMethod)?.label ??
      this.selectedPaymentMethod
    );
  }

  constructor(
    private readonly pageTitle: Title,
    private readonly router: Router,
  ) {}

  protected get isMesasRoute(): boolean {
    return this.router.url === '/mesas';
  }

  protected get isPersonalRoute(): boolean {
    return this.router.url === '/personal';
  }

  protected get filteredItems(): MenuItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.items.filter((item) => {
      const matchesCategory =
        this.activeCategory === 'Todos' || item.category === this.activeCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }

  protected get availableCount(): number {
    return this.items.filter((item) => item.available).length;
  }

  protected get burgerCount(): number {
    return this.items.filter((item) => item.category === 'Hamburguesas').length;
  }

  protected ordersFor(status: KitchenStatus): KitchenOrder[] {
    const query = this.kitchenSearchQuery.trim().toLowerCase();

    return this.kitchenOrders.filter((order) => {
      const matchesStatus = order.status === status;
      const matchesType =
        this.kitchenFilter === 'all' ||
        (this.kitchenFilter === 'delayed' && order.elapsedMinutes >= 10) ||
        (this.kitchenFilter === 'dine-in' && order.service === 'En mesa') ||
        (this.kitchenFilter === 'delivery' && order.service === 'A domicilio');
      const matchesSearch =
        !query ||
        String(order.number).includes(query.replace('#', '')) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));

      return matchesStatus && matchesType && matchesSearch;
    });
  }

  protected kitchenCount(status: KitchenStatus): number {
    return this.kitchenOrders.filter((order) => order.status === status).length;
  }

  protected setKitchenFilter(filter: KitchenFilter): void {
    this.kitchenFilter = filter;
    this.showKitchenFilters = false;
  }

  protected advanceKitchenOrder(order: KitchenOrder): void {
    if (order.status === 'pending') {
      order.status = 'preparing';
    } else if (order.status === 'preparing') {
      order.status = 'ready';
    } else {
      const index = this.kitchenOrders.findIndex(({ id }) => id === order.id);

      if (index !== -1) {
        this.kitchenOrders.splice(index, 1);
      }
    }
  }

  protected setCategory(category: string): void {
    this.activeCategory = category;
  }

  protected selectNavigation(label: string): void {
    if (label === 'Personal') {
      this.pageTitle.setTitle('Personal | BistroOS');
      void this.router.navigateByUrl('/personal');
    } else if (label === 'Mesas') {
      this.pageTitle.setTitle('Mapa de mesas | BistroOS');
      void this.router.navigateByUrl('/mesas');
    } else if (label === 'Cocina') {
      this.activeScreen = 'kds';
      this.pageTitle.setTitle('Cocina | BistroOS');
    } else if (label === 'Pedidos') {
      this.activeScreen = 'checkout';
      this.pageTitle.setTitle('Cobro y liquidación | BistroOS');
    } else if (label === 'Menú') {
      this.activeScreen = 'menu';
      this.pageTitle.setTitle('Gestión del menú | BistroOS');
    }

    if (label !== 'Mesas' && label !== 'Personal' && (this.isMesasRoute || this.isPersonalRoute)) {
      void this.router.navigateByUrl('/');
    }
  }

  protected toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('bistroos-theme', this.theme);
  }

  protected selectTip(option: number | 'Custom'): void {
    this.selectedTip = option;
    this.paymentComplete = false;

    if (!this.paymentAmountEdited) {
      this.paymentAmount = this.totalDue.toFixed(2);
    }
  }

  protected setPaymentMethod(method: PaymentMethodId): void {
    this.selectedPaymentMethod = method;
    this.paymentComplete = false;
  }

  protected setCustomTipPercent(value: number | null): void {
    this.customTipPercent = Math.max(0, value ?? 0);
    this.paymentComplete = false;

    if (!this.paymentAmountEdited) {
      this.paymentAmount = this.totalDue.toFixed(2);
    }
  }

  protected setPaymentAmount(value: number | null): void {
    this.paymentAmount = value === null ? '' : String(value);
    this.keypadInputStarted = true;
    this.paymentAmountEdited = true;
    this.paymentComplete = false;
  }

  protected pressKeypad(key: string): void {
    this.paymentComplete = false;

    if (!this.keypadInputStarted) {
      this.paymentAmount = key === '.' ? '0.' : key;
      this.keypadInputStarted = true;
      this.paymentAmountEdited = true;
      return;
    }

    if (key === '.') {
      if (!this.paymentAmount.includes('.')) {
        this.paymentAmount = `${this.paymentAmount || '0'}.`;
      }
      return;
    }

    if (this.paymentAmount.includes('.')) {
      const decimalPlaces = this.paymentAmount.split('.')[1]?.length ?? 0;

      if (decimalPlaces >= 2) {
        return;
      }
    }

    this.paymentAmount = `${this.paymentAmount}${key}`;
    this.paymentAmountEdited = true;
  }

  protected deleteLastAmountDigit(): void {
    this.paymentAmount = this.paymentAmount.slice(0, -1) || '0';
    this.keypadInputStarted = true;
    this.paymentAmountEdited = true;
    this.paymentComplete = false;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(amount);
  }

  protected printReceipt(): void {
    this.receiptPrinted = true;
    window.print();
  }

  protected processPayment(): void {
    if (this.amountValue > 0) {
      this.paymentComplete = true;
    }
  }

  protected useTotalDue(): void {
    this.paymentAmount = this.totalDue.toFixed(2);
    this.paymentAmountEdited = false;
    this.keypadInputStarted = false;
    this.paymentComplete = false;
  }

  protected toggleAvailability(item: MenuItem): void {
    item.available = !item.available;
  }

  protected openNewItem(): void {
    this.editingItemId = null;
    this.draft = this.createEmptyDraft();
    this.isModalOpen = true;
  }

  protected editItem(item: MenuItem): void {
    this.editingItemId = item.id;
    this.draft = {
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
    };
    this.isModalOpen = true;
  }

  protected closeModal(): void {
    this.isModalOpen = false;
  }

  protected saveItem(): void {
    const name = this.draft.name.trim();

    if (!name || !Number.isFinite(this.draft.price) || this.draft.price <= 0) {
      return;
    }

    if (this.editingItemId !== null) {
      const item = this.items.find(({ id }) => id === this.editingItemId);

      if (item) {
        Object.assign(item, { ...this.draft, name });
      }
    } else {
      this.items.unshift({
        ...this.draft,
        name,
        id: Date.now(),
        available: true,
      });
    }

    this.activeCategory = 'Todos';
    this.closeModal();
  }

  protected deleteItem(item: MenuItem): void {
    if (window.confirm(`¿Eliminar "${item.name}" del menú?`)) {
      const index = this.items.findIndex(({ id }) => id === item.id);

      if (index !== -1) {
        this.items.splice(index, 1);
      }
    }
  }

  private createEmptyDraft(): MenuItemDraft {
    return {
      name: '',
      price: 0,
      category: 'Hamburguesas',
      image:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
    };
  }

  private roundCurrency(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }
}
