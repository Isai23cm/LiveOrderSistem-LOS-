import { Component } from '@angular/core';
import { DatePipe, NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentRecord, PaymentsService } from './payments.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgClass],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent {
  searchTerm = '';
  statusFilter: 'all' | 'completed' | 'refunded' = 'all';
  startDate = '';
  endDate = '';
  currentPage = 1;
  readonly pageSize = 5;

  constructor(private readonly paymentsService: PaymentsService) {}

  get payments(): PaymentRecord[] {
    return this.paymentsService.list();
  }

  get filteredPayments(): PaymentRecord[] {
    const query = this.searchTerm.trim().toLowerCase();
    const from = this.startDate ? new Date(`${this.startDate}T00:00:00`).getTime() : null;
    const through = this.endDate ? new Date(`${this.endDate}T23:59:59.999`).getTime() : null;

    return this.payments.filter((payment) => {
      const timestamp = new Date(payment.date).getTime();
      const matchesStatus = this.statusFilter === 'all' || payment.status === this.statusFilter;
      const matchesQuery =
        !query ||
        [payment.id, payment.cashier, payment.table, payment.method].some((value) =>
          value.toLowerCase().includes(query),
        );

      return (
        matchesStatus &&
        matchesQuery &&
        (from === null || timestamp >= from) &&
        (through === null || timestamp <= through)
      );
    });
  }

  get visiblePayments(): PaymentRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPayments.slice(start, start + this.pageSize);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.pageCount }, (_, index) => index + 1);
  }

  get visibleRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPayments.length);
  }

  get completedRevenue(): number {
    return this.payments
      .filter((payment) => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  get refundTotal(): number {
    return this.payments
      .filter((payment) => payment.status === 'refunded')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.pageCount);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
    }).format(amount);
  }
}