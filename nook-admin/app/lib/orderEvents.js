'use client';

import { useEffect, useState } from 'react';

// Wait this long before reconnecting after the connection drops
const RETRY_MS = 5000;

/**
 * Listens to GET /api/orders/events (Server-Sent Events) and counts changes.
 * Uses fetch rather than EventSource so the login token goes in a header, not the URL.
 *
 * Returns { version, newOrders, live }:
 *   version - goes up whenever orders change, and after every reconnect (in case something
 *             changed while the connection was down), so watch it and reload
 *   newOrders - goes up when a customer places an order - watch it to play a sound
 *   live    - true while connected, false once a connection fails, null before the first try finishes
 */
export default function useOrderEvents(apiUrl, enabled) {
  const [version, setVersion] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let retryTimer = null;
    let firstTry = true;

    const connect = async () => {
      const reconnecting = !firstTry;
      firstTry = false;
      try {
        const res = await fetch(`${apiUrl}/api/orders/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
          signal: controller.signal,
        });
        // A bad token gets JSON back, not a stream - stop rather than retry forever
        if (!(res.headers.get('content-type') || '').startsWith('text/event-stream')) {
          setLive(false);
          return;
        }

        setLive(true);
        if (reconnecting) setVersion(v => v + 1);

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          // Messages end with a blank line
          const messages = buffer.split('\n\n');
          buffer = messages.pop();
          const changes = messages.filter(m => m.split('\n').includes('event: orders-changed'));
          if (changes.length > 0) setVersion(v => v + 1);
          if (changes.some(m => m.includes('"newOrder":true'))) setNewOrders(n => n + 1);
        }
      } catch {
        // dropped or couldn't connect - retry below
      }
      if (controller.signal.aborted) return;
      setLive(false);
      retryTimer = setTimeout(connect, RETRY_MS);
    };

    connect();
    return () => {
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, [apiUrl, enabled]);

  return { version, newOrders, live };
}
