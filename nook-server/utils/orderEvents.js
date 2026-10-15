/*
=======================================================================================================================================
ORDER EVENTS - live "orders changed" messages for the admin orders screens
=======================================================================================================================================
Each open orders screen keeps one connection to GET /api/orders/events (Server-Sent Events).
When an order is placed or changed, notifyOrdersChanged() sends a short message down every
connection and the screens reload their list. Nothing is sent when nothing changes, apart from
a tiny keep-alive comment so proxies don't close idle connections.

The connections live in this process's memory, so this only works with a single server process.
=======================================================================================================================================
*/

// Open connections (Express response objects)
const clients = new Set();

// How often to send the keep-alive comment
const HEARTBEAT_MS = 25000;
let heartbeat = null;

// Starts an event stream on res and keeps it until the browser disconnects
const addClient = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // stop nginx holding messages back
  });
  res.write('retry: 5000\n\n');

  clients.add(res);
  if (!heartbeat) {
    heartbeat = setInterval(() => {
      for (const client of clients) client.write(': ping\n\n');
    }, HEARTBEAT_MS);
  }

  req.on('close', () => {
    clients.delete(res);
    if (clients.size === 0) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
  });
};

// Tells every open orders screen to reload
const notifyOrdersChanged = () => {
  for (const client of clients) client.write('event: orders-changed\ndata: {}\n\n');
};

module.exports = { addClient, notifyOrdersChanged };
