'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

// Everyone sees Orders and Prep Summary. Only admins see Menu and Staff.
const NAV = [
  { href: '/', label: 'Orders' },
  { href: '/summary', label: 'Prep Summary' },
  { href: '/menu', label: 'Menu', roles: ['admin'] },
  { href: '/staff', label: 'Staff', roles: ['admin'] },
];

const ROLE_NAMES = { general: 'General', admin: 'Admin' };

const AdminContext = createContext(null);

// { user, api, logout } for any page wrapped in <AdminShell>
export const useAdmin = () => useContext(AdminContext);

const isActive = (href, pathname) =>
  href === '/' ? pathname === '/' || pathname.startsWith('/orders') : pathname.startsWith(href);

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

  if (!user) return null;

  return (
    <AdminContext.Provider value={{ user, api, logout }}>
      <header className="shell-header">
        <div className="shell-bar">
          <Link href="/" className="shell-brand">the little nook buffet</Link>
          <div className="shell-user">
            <span>{user.full_name || user.username}</span>
            <span className="shell-role">{ROLE_NAMES[user.role] || user.role}</span>
            <button className="shell-logout" onClick={logout}>Log out</button>
          </div>
        </div>
        <nav className="shell-nav">
          {NAV.filter(item => !item.roles || item.roles.includes(user.role)).map(item => (
            <Link key={item.href} href={item.href} className={`shell-nav-item${isActive(item.href, pathname) ? ' active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="shell-main">{children}</main>
    </AdminContext.Provider>
  );
}
