import Decimal from "decimal.js";

export type Role = "Owner" | "Operations" | "Sourcing" | "Client" | "Supplier";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type ClientRecord = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type SupplierRecord = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type PaymentEntry = {
  id: string;
  orderId: string;
  type: "clientCollection" | "supplierPayment";
  amount: number;
  currency: string;
  paymentDate: string;
  reference: string;
  note?: string;
  author: string;
};

export type ConfirmationRecord = {
  id: string;
  orderId: string;
  party: "client" | "supplier";
  amount: number;
  currency: string;
  paymentDate: string;
  reference: string;
  note?: string;
  status: "Pending" | "Awaiting matching" | "Matched" | "Needs review";
  author: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  productName: string;
  sku: string;
  description: string;
  clientId: string;
  supplierId: string;
  sourcingUserId: string;
  minOrderQuantity: number;
  actualQuantity: number;
  currency: string;
  clientUnitPrice: number;
  supplierUnitPrice: number;
  approved: boolean;
  status: "Awaiting approval" | "Approved" | "Flagged" | "Disputed" | "Closed";
  ownerComment?: string;
  shipment?: {
    carrier: string;
    trackingReference: string;
    shipmentDate: string;
    note?: string;
  };
  createdAt: string;
};

export type AssetItem = {
  id: string;
  label: string;
  value: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  role: Role;
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  details: string;
  timestamp: string;
};

export type AppState = {
  clients: ClientRecord[];
  suppliers: SupplierRecord[];
  orders: OrderRecord[];
  payments: PaymentEntry[];
  confirmations: ConfirmationRecord[];
  notifications: NotificationItem[];
  activities: ActivityItem[];
};

export const walkthroughUsers: UserRecord[] = [
  { id: "owner-1", name: "Rina Patel", email: "owner@area71.com", password: "owner123", role: "Owner" },
  { id: "ops-1", name: "Anita Flores", email: "operations@area71.com", password: "ops123", role: "Operations" },
  { id: "sourcing-1", name: "Marcus Hill", email: "sourcing@area71.com", password: "sourcing123", role: "Sourcing" },
  { id: "client-1", name: "Northstar Retail", email: "client@area71.com", password: "client123", role: "Client" },
  { id: "supplier-1", name: "Summit Goods", email: "supplier@area71.com", password: "supplier123", role: "Supplier" },
];

export const navigationByRole: Record<Role, { id: string; label: string }[]> = {
  Owner: [
    { id: "orders", label: "Orders" },
    { id: "approvals", label: "Approvals" },
    { id: "flags", label: "Flags" },
    { id: "clients-suppliers", label: "Clients & Suppliers" },
    { id: "assignments", label: "Assignments" },
    { id: "notifications", label: "Notifications" },
  ],
  Operations: [
    { id: "orders", label: "Orders" },
    { id: "flags", label: "Flags" },
    { id: "clients-suppliers", label: "Clients & Suppliers" },
    { id: "assignments", label: "Assignments" },
    { id: "notifications", label: "Notifications" },
  ],
  Sourcing: [
    { id: "orders", label: "Orders" },
    { id: "flags", label: "Flags" },
    { id: "notifications", label: "Notifications" },
  ],
  Client: [
    { id: "orders", label: "Orders" },
    { id: "notifications", label: "Notifications" },
  ],
  Supplier: [
    { id: "orders", label: "Orders" },
    { id: "notifications", label: "Notifications" },
  ],
};

export const initialClients: ClientRecord[] = [
  { id: "client-1", name: "Northstar Retail", contactPerson: "Elena Brooks", email: "elena@northstarretail.com", phone: "+1 (415) 210-0821" },
  { id: "client-2", name: "Portland Market Co.", contactPerson: "Jules Khan", email: "jules@portlandmarket.co", phone: "+1 (503) 440-8020" },
];

export const initialSuppliers: SupplierRecord[] = [
  { id: "supplier-1", name: "Summit Goods", contactPerson: "Harper Morris", email: "harper@summitgoods.io", phone: "+1 (206) 315-4433" },
  { id: "supplier-2", name: "Bayside Manufacturing", contactPerson: "Aiden Cole", email: "aiden@baysidemfg.com", phone: "+1 (310) 880-1047" },
];

export function formatMoney(amount: number | string, currency = "USD") {
  const value = new Decimal(String(amount ?? 0));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value.toFixed(2)));
}

export function asNumber(value: number | string) {
  return Number(new Decimal(String(value ?? 0)).toFixed(2));
}

export function calculateOrderValues(order: Pick<OrderRecord, "actualQuantity" | "clientUnitPrice" | "supplierUnitPrice" | "currency">) {
  const clientTotal = asNumber(
    new Decimal(String(order.actualQuantity)).mul(new Decimal(String(order.clientUnitPrice))).toString(),
  );
  const supplierTotal = asNumber(
    new Decimal(String(order.actualQuantity)).mul(new Decimal(String(order.supplierUnitPrice))).toString(),
  );
  const grossMargin = asNumber(
    new Decimal(String(clientTotal)).minus(new Decimal(String(supplierTotal))).toString(),
  );

  return {
    clientTotal,
    supplierTotal,
    grossMargin,
  };
}

export function buildInitialState(): AppState {
  const orders: OrderRecord[] = [
    {
      id: "order-1",
      orderNumber: "A71-1042",
      productName: "Portable Thermal Scanner",
      sku: "PTS-220",
      description: "Compact thermal scanner for retail operations and warehouse checks.",
      clientId: "client-1",
      supplierId: "supplier-1",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: 120,
      actualQuantity: 160,
      currency: "USD",
      clientUnitPrice: 55,
      supplierUnitPrice: 42,
      approved: false,
      status: "Awaiting approval",
      createdAt: "2026-11-12T09:00:00.000Z",
      shipment: {
        carrier: "DHL",
        trackingReference: "DHL-982134",
        shipmentDate: "2026-11-16",
        note: "Awaiting route confirmation",
      },
    },
    {
      id: "order-2",
      orderNumber: "A71-1048",
      productName: "Smart Display Stand",
      sku: "SDS-440",
      description: "Heavy-duty display stand built for countertop merchandising.",
      clientId: "client-1",
      supplierId: "supplier-2",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: 200,
      actualQuantity: 200,
      currency: "USD",
      clientUnitPrice: 110,
      supplierUnitPrice: 92,
      approved: true,
      status: "Approved",
      createdAt: "2026-11-04T13:15:00.000Z",
      shipment: {
        carrier: "UPS",
        trackingReference: "UPS-76619",
        shipmentDate: "2026-11-08",
        note: "Delivery is in the final leg.",
      },
    },
    {
      id: "order-3",
      orderNumber: "A71-1051",
      productName: "Eco Smart Lamp",
      sku: "ESL-92",
      description: "Energy efficient lamp with wireless control and premium finish.",
      clientId: "client-2",
      supplierId: "supplier-1",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: 90,
      actualQuantity: 95,
      currency: "USD",
      clientUnitPrice: 48,
      supplierUnitPrice: 38,
      approved: true,
      status: "Flagged",
      createdAt: "2026-11-09T08:35:00.000Z",
      shipment: {
        carrier: "FedEx",
        trackingReference: "FX-55281",
        shipmentDate: "2026-11-14",
        note: "Supplier short-shipped 5 units.",
      },
    },
    {
      id: "order-4",
      orderNumber: "A71-1059",
      productName: "Warehouse Safety Kit",
      sku: "WSK-15",
      description: "Safety pack for warehouse teams and site compliance.",
      clientId: "client-2",
      supplierId: "supplier-2",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: 80,
      actualQuantity: 80,
      currency: "USD",
      clientUnitPrice: 70,
      supplierUnitPrice: 54,
      approved: true,
      status: "Disputed",
      createdAt: "2026-11-10T15:40:00.000Z",
      shipment: {
        carrier: "FreightCo",
        trackingReference: "FR-9840",
        shipmentDate: "2026-11-11",
        note: "Client disputed the collection amount.",
      },
    },
    {
      id: "order-5",
      orderNumber: "A71-1063",
      productName: "Cold Chain Sensor Pack",
      sku: "CCS-77",
      description: "Low-power wireless monitoring kit for temperature-sensitive items.",
      clientId: "client-1",
      supplierId: "supplier-1",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: 150,
      actualQuantity: 150,
      currency: "USD",
      clientUnitPrice: 74,
      supplierUnitPrice: 58,
      approved: true,
      status: "Closed",
      createdAt: "2026-11-06T11:25:00.000Z",
      shipment: {
        carrier: "UPS",
        trackingReference: "UPS-90978",
        shipmentDate: "2026-11-12",
        note: "Final payment reconciled.",
      },
    },
  ];

  const payments: PaymentEntry[] = [
    { id: "pay-1", orderId: "order-2", type: "clientCollection", amount: 22000, currency: "USD", paymentDate: "2026-11-08", reference: "CC-4409", author: "Marcus Hill" },
    { id: "pay-2", orderId: "order-2", type: "supplierPayment", amount: 18400, currency: "USD", paymentDate: "2026-11-09", reference: "SUP-2198", author: "Marcus Hill" },
    { id: "pay-3", orderId: "order-3", type: "supplierPayment", amount: 3800, currency: "USD", paymentDate: "2026-11-12", reference: "SUP-2201", author: "Marcus Hill" },
    { id: "pay-4", orderId: "order-4", type: "clientCollection", amount: 5600, currency: "USD", paymentDate: "2026-11-11", reference: "CC-4411", author: "Marcus Hill" },
    { id: "pay-5", orderId: "order-5", type: "clientCollection", amount: 11100, currency: "USD", paymentDate: "2026-11-13", reference: "CC-4450", author: "Marcus Hill" },
    { id: "pay-6", orderId: "order-5", type: "supplierPayment", amount: 8700, currency: "USD", paymentDate: "2026-11-13", reference: "SUP-2240", author: "Marcus Hill" },
  ];

  const confirmations: ConfirmationRecord[] = [
    { id: "conf-1", orderId: "order-2", party: "client", amount: 22000, currency: "USD", paymentDate: "2026-11-08", reference: "INV-7781", status: "Matched", author: "Northstar Retail" },
    { id: "conf-2", orderId: "order-2", party: "supplier", amount: 18400, currency: "USD", paymentDate: "2026-11-09", reference: "PO-6772", status: "Matched", author: "Summit Goods" },
    { id: "conf-3", orderId: "order-3", party: "supplier", amount: 4500, currency: "USD", paymentDate: "2026-11-12", reference: "GATE-990", status: "Needs review", author: "Summit Goods" },
    { id: "conf-4", orderId: "order-4", party: "client", amount: 4500, currency: "USD", paymentDate: "2026-11-11", reference: "REF-917", status: "Needs review", author: "Portland Market Co." },
  ];

  return {
    clients: initialClients,
    suppliers: initialSuppliers,
    orders,
    payments,
    confirmations,
    notifications: [
      { id: "n-1", title: "Owner approval required", message: "A71-1042 requires approval before Sourcing can proceed.", role: "Owner" },
      { id: "n-2", title: "Supplier confirmation pending", message: "A71-1051 has a $500 difference waiting for resolution.", role: "Operations" },
      { id: "n-3", title: "Client payment disputed", message: "A71-1059 has a disputed client collection amount.", role: "Operations" },
      { id: "n-4", title: "Payment for approval", message: "Your assigned order is ready for Sourcing payment capture.", role: "Sourcing" },
    ],
    activities: [
      { id: "a-1", actor: "Anita Flores", action: "Order created", details: "A71-1042 created and submitted to Owner.", timestamp: "2026-11-12T09:10:00.000Z" },
      { id: "a-2", actor: "Rina Patel", action: "Approved", details: "A71-1048 approved and released to Sourcing.", timestamp: "2026-11-12T10:00:00.000Z" },
      { id: "a-3", actor: "Marcus Hill", action: "Payment recorded", details: "Supplier payment logged for A71-1051.", timestamp: "2026-11-12T14:00:00.000Z" },
    ],
  };
}

export const demoState = buildInitialState();
