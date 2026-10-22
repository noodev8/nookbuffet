'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useOrderEvents from '../lib/orderEvents';
import { playChime, unlockSound } from '../lib/chime';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

// The nav is split into a Sandwiches section and a Buffets section, each with its own
// orders, prep, menu and settings pages, one row each. Everyone sees Orders and Prep; only admins see the menus.
// Staff sits up by Log out (admins only) so it doesn't need a row of its own.
// count: which open-order count to show as a badge on the tab
const SECTIONS = [
  {
    label: 'Sandwiches',
    items: [
      { href: '/', label: 'Orders', count: 'sandwich' },
      { href: '/sandwich-menu', label: 'Menu', roles: ['admin'] },
      { href: '/sandwich-settings', label: 'Settings', roles: ['admin'] },
    ],
  },
  {
    label: 'Buffets',
    items: [
      { href: '/buffet-orders', label: 'Orders', count: 'buffet' },
      { href: '/buffet-prep', label: 'Prep' },
      { href: '/buffet-menu', label: 'Menu', roles: ['admin'] },
    ],
  },
];

const ROLE_NAMES = { general: 'General', admin: 'Admin' };

// How often the open-order badges check for new orders

const AdminContext = createContext(null);

// { user, api, logout, ordersVersion, live } for any page wrapped in <AdminShell>.
// ordersVersion goes up whenever an order is placed or changed - watch it to reload.
export const useAdmin = () => useContext(AdminContext);

// A single order's page (/orders/7) sits under neither list, so it highlights neither
const isActive = (href, pathname) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

/**
 * The header, navigation and login check shared by every admin page.
 * Children only render once we know who is logged in, so pages can fetch straight away.
 *
 * @param {string[]} [roles] - Roles allowed on this page (default: everyone logged in)
 */
export default function AdminShell({ roles, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({ sandwich: 0, buffet: 0 });
  const allowed = roles ? roles.join(',') : '';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const stored = localStorage.getItem('admin_user');
    if (!token || !stored) {
      router.replace('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    if (allowed && !allowed.split(',').includes(parsed.role)) {
      router.replace('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    setUser(parsed);
  }, [router, allowed]);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  }, [router]);

  // fetch() wrapper: adds the login token, sends JSON (or FormData for uploads),
  // and signs out if the session has expired. Returns the server's JSON response.
  const api = useCallback(async (path, { method = 'GET', body } = {}) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('admin_token')}` };
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    const data = await res.json();
    if (data.return_code === 'UNAUTHORIZED') logout();
    return data;
  }, [logout]);

  // One live connection per tab tells us when orders change (see lib/orderEvents.js)
  const { version: ordersVersion, newOrders, live } = useOrderEvents(API_URL, !!user);

  // Chime when a customer places an order. Browsers only allow sound after the page has been
  // clicked or tapped - pressing Log in counts (see login/page.js). After a full page reload,
  // the first tap or key press anywhere quietly turns it back on.
  useEffect(() => {
    const unlock = () => unlockSound().catch(() => {});
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
  useEffect(() => {
    if (newOrders > 0) playChime();
  }, [newOrders]);

  // Open-order counts for the badges on the Sandwich Orders and Buffet Orders tabs.
  // Checked on every page change and whenever orders change, so new orders show up without a refresh.
  // An order with both buffets and sandwiches counts on both tabs.
  useEffect(() => {
    if (!user) return;
    const loadCounts = () => {
      api('/api/orders')
        .then(data => {
          if (data.return_code !== 'SUCCESS') return;
          const orders = data.data || [];
          setCounts({
            sandwich: orders.filter(o => (o.sandwiches || []).length > 0).length,
            buffet: orders.filter(o => (o.buffets || []).length > 0).length,
          });
        })
        .catch(() => {}); // the badges just keep their last numbers
    };
    loadCounts();
  }, [user, api, pathname, ordersVersion]);

  if (!user) return null;

  return (
    <AdminContext.Provider value={{ user, api, logout, ordersVersion, live }}>
      <header className="shell-header">
        <div className="shell-bar">
          <Link href="/" className="shell-brand">the little nook buffet</Link>
          <div className="shell-user">
            <span>{user.full_name || user.username}</span>
            <span className="shell-role">{ROLE_NAMES[user.role] || user.role}</span>
            {user.role === 'admin' && (
              <Link href="/staff" className={`shell-logout${pathname.startsWith('/staff') ? ' active' : ''}`}>Staff</Link>
            )}
            <button className="shell-logout" onClick={logout}>Log out</button>
          </div>
        </div>
        <nav className="shell-nav">
          {SECTIONS.map((section, i) => {
            const items = section.items.filter(item => !item.roles || item.roles.includes(user.role));
            if (items.length === 0) return null;
            return (
              <div key={i} className="shell-nav-group">
                {section.label && <span className="shell-nav-label">{section.label}</span>}
                {items.map(item => (
                  <Link key={item.href} href={item.href} className={`shell-nav-item${isActive(item.href, pathname) ? ' active' : ''}`}>
                    {item.label}
                    {item.count && counts[item.count] > 0 && (
                      <span className="nav-badge" aria-label={`${counts[item.count]} open`}>{counts[item.count]}</span>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>
      </header>
      <main className="shell-main">{children}</main>
    </AdminContext.Provider>
  );
}
