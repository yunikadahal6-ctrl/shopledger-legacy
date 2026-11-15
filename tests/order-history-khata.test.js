'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const orders = require('../lib/orders');
const ledger = require('../lib/ledger');

function orderFixture() {
  return {
    orders: [
      { id: 1, date: '29/03/2024', status: 'completed' },
      { id: 2, date: '30/03/2024', status: 'completed' },
      { id: 3, date: '31/03/2024', status: 'completed' },
      { id: 4, date: '01/04/2024', status: 'completed' },
      { id: 5, date: '02/04/2024', status: 'completed' },
      { id: 6, date: '03/04/2024', status: 'completed' }
    ]
  };
}

test('order history sorts dates in chronological newest-first order', function () {
  const result = orders.list(orderFixture());

  assert.deepEqual(result.map(function (order) { return order.id; }), [6, 5, 4, 3, 2, 1]);
});

test('order history date range includes only orders within inclusive boundaries', function () {
  const result = orders.list(orderFixture(), {
    from: '2024-03-30',
    to: '2024-04-02'
  });
  const ids = result.map(function (order) { return order.id; }).sort(function (a, b) { return a - b; });

  assert.deepEqual(ids, [2, 3, 4, 5]);
});

test('order history from-date includes all later dates across a month boundary', function () {
  const result = orders.list(orderFixture(), { from: '2024-03-30' });
  const ids = result.map(function (order) { return order.id; }).sort(function (a, b) { return a - b; });

  assert.deepEqual(ids, [2, 3, 4, 5, 6]);
});

test('order history to-date includes all earlier dates across a month boundary', function () {
  const result = orders.list(orderFixture(), { to: '2024-04-02' });
  const ids = result.map(function (order) { return order.id; }).sort(function (a, b) { return a - b; });

  assert.deepEqual(ids, [1, 2, 3, 4, 5]);
});

test('Khata settlement adds a string request amount numerically', function () {
  const db = {
    nextSettlementId: 501,
    settlements: [],
    customers: [{
      id: 7,
      name: 'Fixture Customer',
      openingBalance: 0,
      totalBilled: 200,
      totalSettled: 100
    }]
  };

  const result = ledger.recordSettlement(db, 7, '25', 'upi', 'test fixture');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 125);
  assert.equal(result.customer.balance, 75);
  assert.equal(result.settlement.amount, 25);
});
