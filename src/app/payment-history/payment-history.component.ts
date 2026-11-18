import { Component } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';

interface Payment {
  id: string;
  date: string;
  cashier: string;
  table: string;
  amount: string;
  method: 'Card' | 'Cash';
  status: 'Completed' | 'Refunded';
}

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css'],
})
export class PaymentHistoryComponent {
  // Datos de ejemplo: la pantalla es solo visual, sin conexión a Supabase.
  payments: Payment[] = [
    { id: '#TX-90231', date: 'Oct 29, 2026 12:15 PM', cashier: 'Bryan Hernández', table: 'Mesa 4', amount: '$45.50', method: 'Card', status: 'Completed' },
    { id: '#TX-90230', date: 'Oct 29, 2026 11:45 AM', cashier: 'Alberto Silva', table: 'Delivery', amount: '$28.00', method: 'Cash', status: 'Completed' },
    { id: '#TX-90229', date: 'Oct 29, 2026 11:10 AM', cashier: 'Joaquín Camacho', table: 'Mesa 12', amount: '$82.20', method: 'Card', status: 'Completed' },
    { id: '#TX-90228', date: 'Oct 28, 2026 09:30 PM', cashier: 'Bryan Hernández', table: 'Mesa 8', amount: '$112.40', method: 'Card', status: 'Refunded' },
    { id: '#TX-90227', date: 'Oct 28, 2026 08:45 PM', cashier: 'Alberto Silva', table: 'Mesa 3', amount: '$54.00', method: 'Card', status: 'Completed' },
    { id: '#TX-90226', date: 'Oct 28, 2026 07:20 PM', cashier: 'Joaquín Camacho', table: 'Mesa 6', amount: '$67.80', method: 'Cash', status: 'Completed' },
    { id: '#TX-90225', date: 'Oct 28, 2026 06:05 PM', cashier: 'Bryan Hernández', table: 'Delivery', amount: '$31.25', method: 'Card', status: 'Completed' },
  ];

  menu = ['Dashboard', 'Sales', 'Menu Management', 'Table Map', 'Settings'];
}