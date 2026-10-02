'use client';

import AdminShell from '../components/AdminShell';
import OrdersBoard from '../components/OrdersBoard';

// Open buffet orders. Sandwich orders are on the home page.
export default function BuffetOrdersPage() {
  return (
    <AdminShell>
      <OrdersBoard kind="buffet" />
    </AdminShell>
  );
}
