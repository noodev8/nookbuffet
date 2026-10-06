// Shared formatting helpers for the admin portal

// Dates come from the server as UTC timestamps (a collection on 18 Sep arrives as
// "2026-09-17T23:00:00.000Z" during BST), so always work out the day in local time.
// Returns "YYYY-MM-DD" or null.
export const dayKey = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dayKey(d);
};

// "Today", "Tomorrow" or e.g. "Monday 21 September"
export const dayLabel = (key) => {
  if (!key) return 'No date set';
  if (key === addDays(0)) return 'Today';
  if (key === addDays(1)) return 'Tomorrow';
  return new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};

// True if the day is before today
export const isPast = (key) => Boolean(key) && key < addDays(0);

export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const money = (value) => `£${parseFloat(value || 0).toFixed(2)}`;

export const peopleCount = (order) =>
  (order.buffets || []).reduce((sum, b) => sum + (b.num_people || 0), 0);

export const sandwichCount = (order) =>
  (order.sandwiches || []).reduce((sum, s) => sum + (s.quantity || 0), 0);

// "12 people", "3 sandwiches" or "12 people · 3 sandwiches"
export const orderSize = (order) => {
  const parts = [];
  const people = peopleCount(order);
  const sandwiches = sandwichCount(order);
  if (people > 0 || sandwiches === 0) parts.push(`${people} people`);
  if (sandwiches > 0) parts.push(`${sandwiches} sandwich${sandwiches !== 1 ? 'es' : ''}`);
  return parts.join(' · ');
};

// Just the choices, in menu order: "White, Ham, Cheese, Mayo, Toasted"
export const describeSandwich = (sandwich) =>
  (sandwich.options || []).map(option => option.option_name).join(', ');

// No payment is taken online, so every order starts unpaid until staff mark it paid.
// 'waived' only appears on older orders placed through the old staff skip-payment option.
export const isPaid = (order) => order.payment_status === 'paid' || order.payment_status === 'waived';
export const paymentLabel = (order) =>
  order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'waived' ? 'Waived' : 'Unpaid';

// Order statuses: pending (being made) -> ready (customer emailed) -> collected (archived).
// Cancelled orders, and 'completed' ones from before collection was tracked, are archived too.
export const isArchived = (order) => ['collected', 'completed', 'cancelled'].includes(order.status);
export const statusLabel = (order) => ({
  pending: 'Not ready',
  ready: 'Ready',
  collected: 'Collected',
  completed: 'Completed',
  cancelled: 'Cancelled',
})[order.status] || order.status;

// Group items by category name, keeping the order they arrive in
export const groupByCategory = (items) =>
  (items || []).reduce((acc, item) => {
    const cat = item.category_name || 'Other';
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});
