'use client';

import AdminShell from './components/AdminShell';
import OrdersBoard from './components/OrdersBoard';

// The home page: open sandwich orders, by collection time, with what to make shown in the list.
// Buffet orders have their own screen at /buffet-orders.
export default function SandwichOrdersPage() {
  return (
    <AdminShell>
      <OrdersBoard kind="sandwich" />
    </AdminShell>
  );
}
