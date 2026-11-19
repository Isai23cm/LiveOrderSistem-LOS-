import { Injectable } from '@angular/core';

export type PaymentStatus = 'completed' | 'refunded';

export interface PaymentRecord {
  id: string;
  date: string;
  cashier: string;
  table: string;
  amount: number;
  method: string;
  status: PaymentStatus;
}

const STORAGE_KEY = 'bistroos-payments';

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  { id: 'TX-90231', date: '2026-10-29T12:15:00', cashier: 'Bryan Hernández', table: 'Mesa 4', amount: 45.5, method: 'Tarjeta', status: 'completed' },
  { id: 'TX-90230', date: '2026-10-29T11:45:00', cashier: 'Alberto Silva', table: 'A domicilio', amount: 28, method: 'Efectivo', status: 'completed' },
  { id: 'TX-90229', date: '2026-10-29T11:10:00', cashier: 'Joaquín Camacho', table: 'Mesa 12', amount: 82.2, method: 'Tarjeta', status: 'completed' },
  { id: 'TX-90228', date: '2026-10-28T21:30:00', cashier: 'Bryan Hernández', table: 'Mesa 8', amount: 112.4, method: 'Tarjeta', status: 'refunded' },
  { id: 'TX-90227', date: '2026-10-28T20:45:00', cashier: 'Alberto Silva', table: 'Mesa 3', amount: 54, method: 'Tarjeta', status: 'completed' },
  { id: 'TX-90226', date: '2026-10-28T19:20:00', cashier: 'Joaquín Camacho', table: 'Mesa 6', amount: 67.8, method: 'Efectivo', status: 'completed' },
  { id: 'TX-90225', date: '2026-10-28T18:05:00', cashier: 'Bryan Hernández', table: 'A domicilio', amount: 31.25, method: 'Tarjeta', status: 'completed' },
];

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly payments = this.loadPayments();

  list(): PaymentRecord[] {
    return [...this.payments].sort(
      (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
    );
  }

  register(
    amount: number,
    method: string,
    cashier: string,
    table = 'Mesa 06',
  ): PaymentRecord {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RangeError('El importe del pago debe ser mayor que cero.');
    }

    const payment: PaymentRecord = {
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      cashier,
      table,
      amount: Math.round((amount + Number.EPSILON) * 100) / 100,
      method,
      status: 'completed',
    };

    this.payments.unshift(payment);
    this.persistPayments();
    return payment;
  }

  private loadPayments(): PaymentRecord[] {
    const savedPayments = localStorage.getItem(STORAGE_KEY);

    if (savedPayments === null) {
      const initialPayments = [...SAMPLE_PAYMENTS];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPayments));
      return initialPayments;
    }

    const parsedPayments: unknown = JSON.parse(savedPayments);

    if (
      Array.isArray(parsedPayments) &&
      parsedPayments.every(
        (payment) =>
          typeof payment === 'object' &&
          payment !== null &&
          'id' in payment &&
          typeof payment.id === 'string' &&
          'date' in payment &&
          typeof payment.date === 'string' &&
          'cashier' in payment &&
          typeof payment.cashier === 'string' &&
          'table' in payment &&
          typeof payment.table === 'string' &&
          'amount' in payment &&
          typeof payment.amount === 'number' &&
          'method' in payment &&
          typeof payment.method === 'string' &&
          'status' in payment &&
          (payment.status === 'completed' || payment.status === 'refunded'),
      )
    ) {
      return parsedPayments;
    }

    throw new Error('El historial de pagos guardado tiene un formato inválido.');
  }

  private persistPayments(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.payments));
  }
}
