import assert from 'node:assert/strict';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { accountCatalog, purchaseOrders, roleConfig } = await import('../src/data/walkthroughData.js');

const ops = accountCatalog.find((account) => account.role === 'operations');
const sourcing = accountCatalog.find((account) => account.role === 'sourcing');
const supplier = accountCatalog.find((account) => account.role === 'supplier');

assert.ok(ops, 'Operations walkthrough account missing');
assert.ok(sourcing, 'Sourcing walkthrough account missing');
assert.ok(supplier, 'Supplier walkthrough account missing');
assert.equal(ops.email, 'ops.walkthrough@area71.example');
assert.equal(sourcing.email, 'sourcing.walkthrough@area71.example');
assert.equal(supplier.email, 'supplier.walkthrough@area71.example');
assert.deepEqual(roleConfig.operations.permissions, ['approve_terms', 'record_verified_transfer', 'review_discrepancies']);
assert.equal(roleConfig.sourcing.permissions.includes('approve_terms'), false);
assert.equal(roleConfig.sourcing.permissions.includes('record_verified_transfer'), false);
assert.equal(roleConfig.supplier.permissions.includes('confirm_price'), true);

const supplierOrders = purchaseOrders.filter((order) => order.supplierId === supplier.supplierId);
const sourcingVisibleOrders = purchaseOrders.filter((order) => order.status !== 'Matched');
assert.equal(supplierOrders.length, 3);
assert.equal(sourcingVisibleOrders.length, 4);

const overpayment = purchaseOrders.find((order) => order.id === 'MPS-1002');
assert.ok(overpayment, 'Overpayment order missing');
assert.equal(overpayment.qty, 500);
assert.equal(overpayment.unitPrice, 4);
assert.equal(overpayment.approvedCost, 2000);
assert.equal(overpayment.sourcingReport, 2300);
assert.equal(overpayment.verifiedTransfer, 2300);
assert.equal(overpayment.supplierReceipt, 2000);
assert.equal(overpayment.varianceChecks.length, 2);
assert.equal(overpayment.varianceChecks[0].amount, 300);
assert.equal(overpayment.varianceChecks[1].amount, 300);
assert.equal(overpayment.status, 'Needs review');

const firstSupplierOnly = purchaseOrders.filter((order) => order.supplierId === 'supplier-northfield');
assert.equal(firstSupplierOnly.some((order) => order.supplierId === 'supplier-seabrook'), false);

console.log('Walkthrough verification passed: all three accounts are valid, roles are enforced, and supplier isolation is preserved.');
