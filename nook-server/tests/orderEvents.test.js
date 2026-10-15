// Unit tests for the live order updates: connections get "orders-changed" until they close

const { EventEmitter } = require('events');
const { addClient, notifyOrdersChanged } = require('../utils/orderEvents');

// A fake browser connection: records everything written to it
function connect() {
  const req = new EventEmitter();
  const res = { written: '', writeHead: jest.fn(), write(text) { this.written += text; } };
  addClient(req, res);
  return { req, res, close: () => req.emit('close') };
}

describe('order events', () => {
  test('opens an event stream', () => {
    const client = connect();
    expect(client.res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ 'Content-Type': 'text/event-stream' }));
    client.close();
  });

  test('sends orders-changed to every open connection', () => {
    const a = connect();
    const b = connect();
    notifyOrdersChanged();
    expect(a.res.written).toContain('event: orders-changed\n');
    expect(b.res.written).toContain('event: orders-changed\n');
    a.close();
    b.close();
  });

  test('says whether it is a new order', () => {
    const client = connect();
    notifyOrdersChanged({ newOrder: true });
    expect(client.res.written).toContain('data: {"newOrder":true}\n');
    notifyOrdersChanged();
    expect(client.res.written).toContain('data: {"newOrder":false}\n');
    client.close();
  });

  test('stops sending once the connection closes', () => {
    const client = connect();
    client.close();
    const before = client.res.written;
    notifyOrdersChanged();
    expect(client.res.written).toBe(before);
  });
});
