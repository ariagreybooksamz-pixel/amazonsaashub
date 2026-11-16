const getWalkthroughValue = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? fallback;
  }

  return fallback;
};

export const roleConfig = {
  operations: {
    label: 'Operations Team',
    title: 'Operations Control Tower',
    description: 'Approves supplier terms, verifies transfers, and reviews discrepancies.',
    permissions: ['approve_terms', 'record_verified_transfer', 'review_discrepancies'],
  },
  sourcing: {
    label: 'Sourcing Team',
    title: 'Sourcing Execution View',
    description: 'Creates requests and submits sourcing reports for operational review.',
    permissions: ['create_purchase_request', 'submit_reported_payment'],
  },
  supplier: {
    label: 'Supplier',
    title: 'Supplier Portal',
    description: 'Confirms pricing, shipments, and receipt details for assigned orders.',
    permissions: ['confirm_price', 'confirm_quantity', 'submit_amount_received', 'update_shipment_details'],
  },
};

export const supplierCatalog = [
  {
    id: 'supplier-northfield',
    name: 'Northfield Packaging',
    region: 'Midwest',
    status: 'Approved',
    contact: 'Lena Ortiz',
  },
  {
    id: 'supplier-seabrook',
    name: 'Seabrook Industrial',
    region: 'Northeast',
    status: 'Under review',
    contact: 'Marcus Chen',
  },
];

export const clientCatalog = [
  { id: 'client-summit-retail', name: 'Summit Retail Group', segment: 'Home Essentials' },
  { id: 'client-harbor-foods', name: 'Harbor Foods Co.', segment: 'Grocery' },
  { id: 'client-northline-home', name: 'Northline Home', segment: 'Household' },
];

export const accountCatalog = [
  {
    id: 'ops-team',
    role: 'operations',
    name: 'Alicia Warren',
    email: getWalkthroughValue('VITE_WALKTHROUGH_OPERATIONS_EMAIL', 'ops.walkthrough@local.test'),
    password: getWalkthroughValue('VITE_WALKTHROUGH_OPERATIONS_PASSWORD', 'OpsWalkthrough123!'),
    workspace: 'Operations Workspace',
    location: 'Houston, TX',
  },
  {
    id: 'sourcing-team',
    role: 'sourcing',
    name: 'Marco Stevenson',
    email: getWalkthroughValue('VITE_WALKTHROUGH_SOURCING_EMAIL', 'sourcing.walkthrough@local.test'),
    password: getWalkthroughValue('VITE_WALKTHROUGH_SOURCING_PASSWORD', 'SourcingWalkthrough123!'),
    workspace: 'Sourcing Workspace',
    location: 'Chicago, IL',
  },
  {
    id: 'supplier-team',
    role: 'supplier',
    name: 'Lena Ortiz',
    email: getWalkthroughValue('VITE_WALKTHROUGH_SUPPLIER_EMAIL', 'supplier.walkthrough@local.test'),
    password: getWalkthroughValue('VITE_WALKTHROUGH_SUPPLIER_PASSWORD', 'SupplierWalkthrough123!'),
    workspace: 'Northfield Packaging Portal',
    location: 'Cincinnati, OH',
    supplierId: 'supplier-northfield',
  },
];

export const purchaseOrders = [
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
    actionLabel: 'Approve terms',
    workflowNote: 'All direct costs and receipts align. No follow-up required.',
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
    actionLabel: 'Review variance',
    workflowNote: 'Two $300 checks are shown independently and should not be combined into $600.',
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
    actionLabel: 'Confirm mismatch',
    workflowNote: 'Sourcing submitted a higher payment request than the approved purchase order.',
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
    actionLabel: 'Submit receipt',
    workflowNote: 'Supplier has not yet confirmed the amount received for this order.',
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
    actionLabel: 'Update shipment status',
    workflowNote: 'Only part of the shipment has been received and pricing remains under review.',
  },
];

export const privateNarrative = {
  walkthroughScope: 'Staging walkthrough environment',
  note: 'This rollout is invite-only. Sample records are fictional and restricted to management review.',
};
