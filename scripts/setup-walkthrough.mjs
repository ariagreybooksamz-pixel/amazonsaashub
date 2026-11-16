import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredEnvKeys = [
  'VITE_WALKTHROUGH_OPERATIONS_EMAIL',
  'VITE_WALKTHROUGH_OPERATIONS_PASSWORD',
  'VITE_WALKTHROUGH_SOURCING_EMAIL',
  'VITE_WALKTHROUGH_SOURCING_PASSWORD',
  'VITE_WALKTHROUGH_SUPPLIER_EMAIL',
  'VITE_WALKTHROUGH_SUPPLIER_PASSWORD',
];

for (const key of requiredEnvKeys) {
  if (!process.env[key] || !process.env[key].trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const environment = process.env.WALKTHROUGH_ENV || 'staging';

const supplierCatalog = [
  { id: 'supplier-northfield', name: 'Northfield Packaging', region: 'Midwest', status: 'Approved' },
  { id: 'supplier-seabrook', name: 'Seabrook Industrial', region: 'Northeast', status: 'Under review' },
];

const clientCatalog = [
  { id: 'client-summit-retail', name: 'Summit Retail Group', segment: 'Home Essentials' },
  { id: 'client-harbor-foods', name: 'Harbor Foods Co.', segment: 'Grocery' },
  { id: 'client-northline-home', name: 'Northline Home', segment: 'Household' },
];

const purchaseOrders = [
  {
    id: 'MPS-1001',
    clientId: 'client-summit-retail',
    supplierId: 'supplier-northfield',
    title: 'Seasonal display replenishment',
    status: 'Matched',
    qty: 300,
    unitPrice: 4,
    approvedCost: 1200,
    sourcingReport: 1200,
    verifiedTransfer: 1200,
    supplierReceipt: 1200,
  },
  {
    id: 'MPS-1002',
    clientId: 'client-harbor-foods',
    supplierId: 'supplier-northfield',
    title: 'Inventory buffer top-up',
    status: 'Needs review',
    qty: 500,
    unitPrice: 4,
    approvedCost: 2000,
    sourcingReport: 2300,
    verifiedTransfer: 2300,
    supplierReceipt: 2000,
    varianceChecks: [
      { label: 'Sourcing report variance', amount: 300 },
      { label: 'Verified transfer variance', amount: 300 },
    ],
  },
  {
    id: 'MPS-1003',
    clientId: 'client-northline-home',
    supplierId: 'supplier-seabrook',
    title: 'Home line replenishment',
    status: 'Report mismatch',
    qty: 420,
    unitPrice: 5,
    approvedCost: 1800,
    sourcingReport: 2100,
    verifiedTransfer: 1800,
    supplierReceipt: 1800,
  },
  {
    id: 'MPS-1004',
    clientId: 'client-summit-retail',
    supplierId: 'supplier-northfield',
    title: 'Q4 product push',
    status: 'Pending supplier receipt',
    qty: 480,
    unitPrice: 4,
    approvedCost: 2200,
    sourcingReport: 2200,
    verifiedTransfer: 2200,
    supplierReceipt: 0,
  },
  {
    id: 'MPS-1005',
    clientId: 'client-harbor-foods',
    supplierId: 'supplier-seabrook',
    title: 'Regional restock request',
    status: 'Partial shipment',
    qty: 650,
    unitPrice: 3.5,
    approvedCost: 2275,
    sourcingReport: 2275,
    verifiedTransfer: 2275,
    supplierReceipt: 1500,
  },
];

const accounts = [
  {
    id: 'operations-team',
    role: 'operations',
    name: 'Alicia Warren',
    email: process.env.VITE_WALKTHROUGH_OPERATIONS_EMAIL,
    workspace: 'Operations Workspace',
    location: 'Houston, TX',
  },
  {
    id: 'sourcing-team',
    role: 'sourcing',
    name: 'Marco Stevenson',
    email: process.env.VITE_WALKTHROUGH_SOURCING_EMAIL,
    workspace: 'Sourcing Workspace',
    location: 'Chicago, IL',
  },
  {
    id: 'supplier-team',
    role: 'supplier',
    name: 'Lena Ortiz',
    email: process.env.VITE_WALKTHROUGH_SUPPLIER_EMAIL,
    workspace: 'Northfield Packaging Portal',
    location: 'Cincinnati, OH',
    supplierId: 'supplier-northfield',
  },
];

const seed = {
  environment,
  generatedAt: new Date().toISOString(),
  scope: 'walkthrough-staging',
  accounts,
  suppliers: supplierCatalog,
  clients: clientCatalog,
  purchaseOrders,
};

const outputDir = path.resolve(process.cwd(), 'data');
const outputPath = path.join(outputDir, 'walkthrough-seed.json');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(seed, null, 2) + '\n', 'utf8');

console.log('Walkthrough seed created successfully for the staging environment.');
console.log('Accounts seeded: operations, sourcing, supplier roles only.');
