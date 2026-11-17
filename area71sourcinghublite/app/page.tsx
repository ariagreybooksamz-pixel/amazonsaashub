"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell } from "lucide-react";
import {
  type AppState,
  type ClientRecord,
  type OrderRecord,
  type SupplierRecord,
  type UserRecord,
  asNumber,
  buildInitialState,
  calculateOrderValues,
  formatMoney,
  navigationByRole,
  walkthroughUsers,
} from "@/lib/area71";
import { Badge, Button, Input, Panel, Select, StatCard, TextArea } from "@/components/ui";

const STORAGE_KEY = "area71-lite-state";
const SESSION_KEY = "area71-lite-session";

type ViewKey = "orders" | "approvals" | "flags" | "clients-suppliers" | "assignments" | "notifications";

type Session = {
  user: UserRecord;
};

const defaultState = buildInitialState();

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return nowIso().slice(0, 10);
}

function cloneState(state: AppState): AppState {
  return JSON.parse(JSON.stringify(state));
}

function getClientName(clients: ClientRecord[], id: string) {
  return clients.find((client) => client.id === id)?.name ?? "Unknown client";
}

function getSupplierName(suppliers: SupplierRecord[], id: string) {
  return suppliers.find((supplier) => supplier.id === id)?.name ?? "Unknown supplier";
}

function getOrderValues(order: OrderRecord) {
  return calculateOrderValues(order);
}

function getOrderDifference(order: OrderRecord, payments: AppState["payments"], confirmations: AppState["confirmations"]) {
  const clientCollection = payments
    .filter((payment) => payment.orderId === order.id && payment.type === "clientCollection")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const supplierPayment = payments
    .filter((payment) => payment.orderId === order.id && payment.type === "supplierPayment")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const clientConfirmation = confirmations
    .filter((confirmation) => confirmation.orderId === order.id && confirmation.party === "client")
    .reduce((sum, confirmation) => sum + confirmation.amount, 0);
  const supplierConfirmation = confirmations
    .filter((confirmation) => confirmation.orderId === order.id && confirmation.party === "supplier")
    .reduce((sum, confirmation) => sum + confirmation.amount, 0);

  return {
    clientDifference: asNumber(Number((clientCollection - clientConfirmation).toFixed(2))),
    supplierDifference: asNumber(Number((supplierPayment - supplierConfirmation).toFixed(2))),
  };
}

function SignInScreen({ onSignIn }: { onSignIn: (user: UserRecord) => void }) {
  const [email, setEmail] = useState("operations@area71.com");
  const [password, setPassword] = useState("ops123");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const user = walkthroughUsers.find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password,
    );

    if (!user) {
      setError("Incorrect email or password.");
      return;
    }

    setError("");
    onSignIn(user);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-10 text-[#172B4D]">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-[#E5E7EB] bg-[#F7F8FA] p-8 lg:border-b-0 lg:border-r">
            <div className="mb-5 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#087F6D]">
              Area71 Sourcing Hub Lite
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Procurement visibility for the full cash flow story.</h1>
            <p className="mt-4 max-w-lg text-base text-[#64748B]">
              Reconcile approved pricing, Sourcing payments, and independent client or supplier confirmations with one shared operating view.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Owner</div>
                <div className="mt-2 font-semibold">owner@area71.com</div>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Operations</div>
                <div className="mt-2 font-semibold">operations@area71.com</div>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Sourcing</div>
                <div className="mt-2 font-semibold">sourcing@area71.com</div>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Client</div>
                <div className="mt-2 font-semibold">client@area71.com</div>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 col-span-2">
                <div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Supplier</div>
                <div className="mt-2 font-semibold">supplier@area71.com</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-semibold">Sign in</h2>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
              <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              <Button type="submit" className="w-full">
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <div className="mt-5 rounded-2xl bg-[#F7F8FA] p-3 text-sm text-[#64748B]">
              Demo password pattern: owner123, ops123, sourcing123, client123, supplier123.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ session, appState, setAppState, onSignOut }: { session: Session; appState: AppState; setAppState: (state: AppState) => void; onSignOut: () => void }) {
  const [view, setView] = useState<ViewKey>("orders");
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", contactPerson: "", email: "", phone: "" });
  const [supplierForm, setSupplierForm] = useState({ name: "", contactPerson: "", email: "", phone: "" });
  const [orderForm, setOrderForm] = useState({
    productName: "",
    sku: "",
    description: "",
    clientId: appState.clients[0]?.id ?? "",
    supplierId: appState.suppliers[0]?.id ?? "",
    sourcingUserId: "sourcing-1",
    minOrderQuantity: "100",
    actualQuantity: "100",
    currency: "USD",
    clientUnitPrice: "52",
    supplierUnitPrice: "41",
  });

  const userRole = session.user.role;
  const nav = navigationByRole[userRole];
  const visibleOrders = useMemo(() => {
    if (userRole === "Owner") return appState.orders;
    if (userRole === "Operations") return appState.orders;
    if (userRole === "Sourcing") return appState.orders.filter((order) => order.sourcingUserId === session.user.id);
    if (userRole === "Client") return appState.orders.filter((order) => order.clientId === "client-1");
    if (userRole === "Supplier") return appState.orders.filter((order) => order.supplierId === "supplier-1");
    return [];
  }, [session.user.id, userRole, appState]);

  const approvals = appState.orders.filter((order) => !order.approved);
  const flags = appState.orders.filter((order) => order.status === "Flagged" || order.status === "Disputed");

  const createClient = () => {
    if (!clientForm.name || !clientForm.contactPerson || !clientForm.email) return;
    const nextClient: ClientRecord = {
      id: createId("client"),
      name: clientForm.name,
      contactPerson: clientForm.contactPerson,
      email: clientForm.email,
      phone: clientForm.phone,
    };
    const nextState = cloneState(appState);
    nextState.clients.push(nextClient);
    nextState.activities.unshift({ id: createId("activity"), actor: "Anita Flores", action: "Client created", details: `${nextClient.name} was created and assigned to the client registry.`, timestamp: nowIso() });
    setAppState(nextState);
    setClientForm({ name: "", contactPerson: "", email: "", phone: "" });
    setShowCreateClient(false);
  };

  const createSupplier = () => {
    if (!supplierForm.name || !supplierForm.contactPerson || !supplierForm.email) return;
    const nextSupplier: SupplierRecord = {
      id: createId("supplier"),
      name: supplierForm.name,
      contactPerson: supplierForm.contactPerson,
      email: supplierForm.email,
      phone: supplierForm.phone,
    };
    const nextState = cloneState(appState);
    nextState.suppliers.push(nextSupplier);
    nextState.activities.unshift({ id: createId("activity"), actor: "Anita Flores", action: "Supplier created", details: `${nextSupplier.name} was created and saved for procurement operations.`, timestamp: nowIso() });
    setAppState(nextState);
    setSupplierForm({ name: "", contactPerson: "", email: "", phone: "" });
    setShowCreateSupplier(false);
  };

  const createOrder = () => {
    if (!orderForm.productName || !orderForm.clientId || !orderForm.supplierId) return;
    const nextOrder: OrderRecord = {
      id: createId("order"),
      orderNumber: `A71-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      productName: orderForm.productName,
      sku: orderForm.sku || "AUTO-SKU",
      description: orderForm.description || "New order submitted for review.",
      clientId: orderForm.clientId,
      supplierId: orderForm.supplierId,
      sourcingUserId: orderForm.sourcingUserId,
      minOrderQuantity: Number(orderForm.minOrderQuantity),
      actualQuantity: Number(orderForm.actualQuantity),
      currency: orderForm.currency,
      clientUnitPrice: Number(orderForm.clientUnitPrice),
      supplierUnitPrice: Number(orderForm.supplierUnitPrice),
      approved: false,
      status: "Awaiting approval",
      createdAt: nowIso(),
    };
    const nextState = cloneState(appState);
    nextState.orders.unshift(nextOrder);
    nextState.notifications.unshift({ id: createId("notification"), title: "Order needs approval", message: `${nextOrder.orderNumber} needs review before Sourcing continues.`, role: "Owner" });
    nextState.activities.unshift({ id: createId("activity"), actor: "Anita Flores", action: "Order submitted", details: `${nextOrder.orderNumber} was submitted for Owner approval.`, timestamp: nowIso() });
    setAppState(nextState);
    setOrderForm({
      productName: "",
      sku: "",
      description: "",
      clientId: appState.clients[0]?.id ?? "",
      supplierId: appState.suppliers[0]?.id ?? "",
      sourcingUserId: "sourcing-1",
      minOrderQuantity: "100",
      actualQuantity: "100",
      currency: "USD",
      clientUnitPrice: "52",
      supplierUnitPrice: "41",
    });
    setShowCreateOrder(false);
  };

  const recordPayment = (orderId: string, type: "clientCollection" | "supplierPayment") => {
    const form = document.getElementById(`payment-${type}-${orderId}`) as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const amount = Number(data.get("amount"));
    const reference = String(data.get("reference") || "");
    if (!amount || !reference) return;

    const nextState = cloneState(appState);
    nextState.payments.push({
      id: createId("pay"),
      orderId,
      type,
      amount,
      currency: String(data.get("currency") || "USD"),
      paymentDate: String(data.get("paymentDate") || todayIso()),
      reference,
      note: String(data.get("note") || ""),
      author: session.user.name,
    });
    nextState.activities.unshift({ id: createId("activity"), actor: session.user.name, action: "Payment recorded", details: `${type === "clientCollection" ? "Client collection" : "Supplier payment"} logged on ${orderId}.`, timestamp: nowIso() });
    setAppState(nextState);
    form.reset();
  };

  const submitConfirmation = (orderId: string, party: "client" | "supplier") => {
    const form = document.getElementById(`confirmation-${party}-${orderId}`) as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const amount = Number(data.get("amount"));
    const reference = String(data.get("reference") || "");
    if (!amount || !reference) return;

    const nextState = cloneState(appState);
    nextState.confirmations.push({
      id: createId("conf"),
      orderId,
      party,
      amount,
      currency: String(data.get("currency") || "USD"),
      paymentDate: String(data.get("paymentDate") || todayIso()),
      reference,
      note: String(data.get("note") || ""),
      status: "Awaiting matching",
      author: session.user.name,
    });
    nextState.activities.unshift({ id: createId("activity"), actor: session.user.name, action: "Confirmation submitted", details: `${party === "client" ? "Client" : "Supplier"} confirmation submitted for ${orderId}.`, timestamp: nowIso() });
    setAppState(nextState);
    form.reset();
  };

  const approveOrder = (orderId: string) => {
    const nextState = cloneState(appState);
    const target = nextState.orders.find((order) => order.id === orderId);
    if (!target) return;
    target.approved = true;
    target.status = "Approved";
    target.ownerComment = "Approved by Owner";
    nextState.notifications.unshift({ id: createId("notification"), title: "Order approved", message: `${target.orderNumber} has been approved and is now visible in the assigned Sourcing workspace.`, role: "Sourcing" });
    nextState.activities.unshift({ id: createId("activity"), actor: "Rina Patel", action: "Approved order", details: `${target.orderNumber} was approved.`, timestamp: nowIso() });
    setAppState(nextState);
  };

  const renderOrderCard = (order: OrderRecord) => {
    const orderValues = getOrderValues(order);
    const clientName = getClientName(appState.clients, order.clientId);
    const supplierName = getSupplierName(appState.suppliers, order.supplierId);
    const { clientDifference, supplierDifference } = getOrderDifference(order, appState.payments, appState.confirmations);
    const isClient = userRole === "Client";
    const isSupplier = userRole === "Supplier";

    return (
      <Panel key={order.id} className="mb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[#172B4D]">{order.orderNumber}</span>
              <Badge kind={order.approved ? "green" : order.status === "Disputed" ? "red" : "amber"}>{order.status}</Badge>
            </div>
            <div className="mt-1 text-sm text-[#64748B]">{order.productName} • {order.sku}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#F7F8FA] px-3 py-2 text-sm text-[#172B4D]">
              {clientName} ↔ {supplierName}
            </div>
            {userRole === "Owner" && !order.approved ? (
              <Button variant="primary" onClick={() => approveOrder(order.id)}>Approve</Button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Client total" value={formatMoney(orderValues.clientTotal, order.currency)} detail={`Qty ${order.actualQuantity}`} />
          <StatCard label="Supplier total" value={formatMoney(orderValues.supplierTotal, order.currency)} detail={`MOQ ${order.minOrderQuantity}`} />
          <StatCard label="Gross margin" value={formatMoney(orderValues.grossMargin, order.currency)} detail="Before fees" />
          <StatCard label="Variance" value={formatMoney(clientDifference + supplierDifference, order.currency)} detail="Difference review" />
        </div>

        {!isClient && !isSupplier ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <form id={`payment-clientCollection-${order.id}`} className="rounded-2xl border border-[#E5E7EB] p-4">
              <div className="mb-3 text-sm font-semibold text-[#172B4D]">Record client payment</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Amount" name="amount" type="number" min="0" step="0.01" defaultValue={0} />
                <Select label="Currency" name="currency" defaultValue="USD"><option value="USD">USD</option></Select>
                <Input label="Payment date" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                <Input label="Reference" name="reference" defaultValue="" />
              </div>
              <TextArea label="Note" name="note" rows={2} defaultValue="" className="mt-3" />
              <div className="mt-3 flex justify-end">
                <Button type="button" onClick={() => recordPayment(order.id, "clientCollection")}>Save collection</Button>
              </div>
            </form>

            <form id={`payment-supplierPayment-${order.id}`} className="rounded-2xl border border-[#E5E7EB] p-4">
              <div className="mb-3 text-sm font-semibold text-[#172B4D]">Record supplier payment</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Amount" name="amount" type="number" min="0" step="0.01" defaultValue={0} />
                <Select label="Currency" name="currency" defaultValue="USD"><option value="USD">USD</option></Select>
                <Input label="Payment date" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                <Input label="Reference" name="reference" defaultValue="" />
              </div>
              <TextArea label="Note" name="note" rows={2} defaultValue="" className="mt-3" />
              <div className="mt-3 flex justify-end">
                <Button type="button" onClick={() => recordPayment(order.id, "supplierPayment")}>Save supplier payment</Button>
              </div>
            </form>
          </div>
        ) : null}

        {isClient ? (
          <form id={`confirmation-client-${order.id}`} className="mt-5 rounded-2xl border border-[#E5E7EB] p-4">
            <div className="mb-3 text-sm font-semibold text-[#172B4D]">Client confirmation</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Amount actually paid" name="amount" type="number" min="0" step="0.01" defaultValue={0} />
              <Select label="Currency" name="currency" defaultValue="USD"><option value="USD">USD</option></Select>
              <Input label="Payment date" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Input label="Bank reference" name="reference" defaultValue="" />
            </div>
            <TextArea label="Comment" name="note" rows={2} defaultValue="" className="mt-3" />
            <div className="mt-3 flex justify-end">
              <Button type="button" onClick={() => submitConfirmation(order.id, "client")}>Submit payment confirmation</Button>
            </div>
          </form>
        ) : null}

        {isSupplier ? (
          <form id={`confirmation-supplier-${order.id}`} className="mt-5 rounded-2xl border border-[#E5E7EB] p-4">
            <div className="mb-3 text-sm font-semibold text-[#172B4D]">Supplier receipt confirmation</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Amount received" name="amount" type="number" min="0" step="0.01" defaultValue={0} />
              <Select label="Currency" name="currency" defaultValue="USD"><option value="USD">USD</option></Select>
              <Input label="Receipt date" name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Input label="Payment reference" name="reference" defaultValue="" />
            </div>
            <TextArea label="Comment" name="note" rows={2} defaultValue="" className="mt-3" />
            <div className="mt-3 flex justify-end">
              <Button type="button" onClick={() => submitConfirmation(order.id, "supplier")}>Submit receipt confirmation</Button>
            </div>
          </form>
        ) : null}
      </Panel>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172B4D]">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 xl:px-6">
        <aside className="hidden w-[232px] shrink-0 rounded-[26px] border border-[#E5E7EB] bg-[#172B4D] p-4 text-white sm:block">
          <div className="mb-8 px-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-300">Area71</div>
            <div className="mt-1 text-xl font-semibold">Sourcing Hub Lite</div>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewKey)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${view === item.id ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"}`}
              >
                <span>{item.label}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs uppercase tracking-[0.1em] text-slate-300">Signed in</div>
            <div className="mt-2 font-semibold">{session.user.name}</div>
            <div className="text-sm text-slate-300">{session.user.role}</div>
          </div>
          <button className="mt-8 w-full rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5" onClick={onSignOut}>
            Sign out
          </button>
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-col gap-3 rounded-[26px] border border-[#E5E7EB] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-[#64748B]">{userRole} workspace</div>
              <h1 className="mt-1 text-3xl font-semibold text-[#172B4D]">
                {userRole === "Owner" && "Approval queue"}
                {userRole === "Operations" && "Operations overview"}
                {userRole === "Sourcing" && "Assigned procurement orders"}
                {userRole === "Client" && "Client dashboard"}
                {userRole === "Supplier" && "Supplier dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-[#E5E7EB] p-2 text-[#172B4D]">
                <Bell className="h-4 w-4" />
              </button>
              {userRole === "Operations" ? (
                <Button onClick={() => setShowCreateOrder(true)}>Create order</Button>
              ) : null}
            </div>
          </header>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Orders" value={String(appState.orders.length)} detail="Total tracked" />
            <StatCard label="Approved" value={String(appState.orders.filter((order) => order.approved).length)} detail="Released to Sourcing" />
            <StatCard label="Flags" value={String(flags.length)} detail="Needs resolution" />
          </div>

          {view === "orders" ? (
            <div>
              {visibleOrders.length ? visibleOrders.map(renderOrderCard) : <Panel>No orders are available for this account.</Panel>}
            </div>
          ) : null}

          {view === "approvals" ? (
            <div>
              {approvals.length ? approvals.map((order) => (
                <Panel key={order.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{order.orderNumber}</div>
                      <div className="text-sm text-[#64748B]">{order.productName}</div>
                    </div>
                    <Button onClick={() => approveOrder(order.id)}>Approve</Button>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div><div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Client</div><div className="mt-1 font-medium">{getClientName(appState.clients, order.clientId)}</div></div>
                    <div><div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Supplier</div><div className="mt-1 font-medium">{getSupplierName(appState.suppliers, order.supplierId)}</div></div>
                    <div><div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Gross margin</div><div className="mt-1 font-medium">{formatMoney(getOrderValues(order).grossMargin, order.currency)}</div></div>
                  </div>
                </Panel>
              )) : <Panel>There are no orders awaiting approval.</Panel>}
            </div>
          ) : null}

          {view === "flags" ? (
            <div>
              {flags.length ? flags.map((order) => (
                <Panel key={order.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{order.orderNumber}</div>
                    <Badge kind="red">{order.status}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-[#64748B]">{order.productName} has a mismatch that needs a management review.</div>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div><div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Client confirmation</div><div className="font-medium">{formatMoney(appState.confirmations.filter((confirmation) => confirmation.orderId === order.id && confirmation.party === "client").reduce((sum, item) => sum + item.amount, 0), order.currency)}</div></div>
                    <div><div className="text-xs uppercase tracking-[0.1em] text-[#64748B]">Supplier receipt</div><div className="font-medium">{formatMoney(appState.confirmations.filter((confirmation) => confirmation.orderId === order.id && confirmation.party === "supplier").reduce((sum, item) => sum + item.amount, 0), order.currency)}</div></div>
                  </div>
                </Panel>
              )) : <Panel>No active financial flags are open.</Panel>}
            </div>
          ) : null}

          {view === "clients-suppliers" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xl font-semibold">Clients</div>
                  <Button variant="secondary" onClick={() => setShowCreateClient((value) => !value)}>Add client</Button>
                </div>
                {showCreateClient ? (
                  <div className="mb-4 space-y-3 rounded-2xl border border-[#E5E7EB] p-4">
                    <Input label="Client name" value={clientForm.name} onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))} />
                    <Input label="Contact person" value={clientForm.contactPerson} onChange={(event) => setClientForm((current) => ({ ...current, contactPerson: event.target.value }))} />
                    <Input label="Email" type="email" value={clientForm.email} onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))} />
                    <Input label="Phone" value={clientForm.phone} onChange={(event) => setClientForm((current) => ({ ...current, phone: event.target.value }))} />
                    <div className="flex justify-end"><Button onClick={createClient}>Save client</Button></div>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {appState.clients.map((client) => (
                    <div key={client.id} className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-[#64748B]">{client.contactPerson}</div>
                      <div className="text-sm text-[#64748B]">{client.email}</div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xl font-semibold">Suppliers</div>
                  <Button variant="secondary" onClick={() => setShowCreateSupplier((value) => !value)}>Add supplier</Button>
                </div>
                {showCreateSupplier ? (
                  <div className="mb-4 space-y-3 rounded-2xl border border-[#E5E7EB] p-4">
                    <Input label="Supplier name" value={supplierForm.name} onChange={(event) => setSupplierForm((current) => ({ ...current, name: event.target.value }))} />
                    <Input label="Contact person" value={supplierForm.contactPerson} onChange={(event) => setSupplierForm((current) => ({ ...current, contactPerson: event.target.value }))} />
                    <Input label="Email" type="email" value={supplierForm.email} onChange={(event) => setSupplierForm((current) => ({ ...current, email: event.target.value }))} />
                    <Input label="Phone" value={supplierForm.phone} onChange={(event) => setSupplierForm((current) => ({ ...current, phone: event.target.value }))} />
                    <div className="flex justify-end"><Button onClick={createSupplier}>Save supplier</Button></div>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {appState.suppliers.map((supplier) => (
                    <div key={supplier.id} className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3">
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-[#64748B]">{supplier.contactPerson}</div>
                      <div className="text-sm text-[#64748B]">{supplier.email}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}

          {view === "assignments" ? (
            <Panel>
              <div className="mb-4 text-xl font-semibold">Assignment workspace</div>
              <div className="grid gap-3 md:grid-cols-2">
                {walkthroughUsers.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-[#64748B]">{user.email}</div>
                      </div>
                      <Badge kind={user.role === "Owner" ? "green" : user.role === "Operations" ? "blue" : "amber"}>{user.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {view === "notifications" ? (
            <div className="space-y-4">
              {appState.notifications.map((notification) => (
                <Panel key={notification.id}>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold">{notification.title}</div>
                    <Badge kind="blue">{notification.role}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-[#64748B]">{notification.message}</div>
                </Panel>
              ))}
            </div>
          ) : null}
        </main>
      </div>

      {showCreateOrder ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-[#64748B]">Operations</div>
                <h2 className="text-2xl font-semibold text-[#172B4D]">Create order</h2>
              </div>
              <button className="text-sm text-[#64748B]" onClick={() => setShowCreateOrder(false)}>Close</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Product name" value={orderForm.productName} onChange={(event) => setOrderForm((current) => ({ ...current, productName: event.target.value }))} />
              <Input label="SKU" value={orderForm.sku} onChange={(event) => setOrderForm((current) => ({ ...current, sku: event.target.value }))} />
              <Select label="Client" value={orderForm.clientId} onChange={(event) => setOrderForm((current) => ({ ...current, clientId: event.target.value }))}>
                {appState.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </Select>
              <Select label="Supplier" value={orderForm.supplierId} onChange={(event) => setOrderForm((current) => ({ ...current, supplierId: event.target.value }))}>
                {appState.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </Select>
              <Input label="MOQ" type="number" value={orderForm.minOrderQuantity} onChange={(event) => setOrderForm((current) => ({ ...current, minOrderQuantity: event.target.value }))} />
              <Input label="Actual quantity" type="number" value={orderForm.actualQuantity} onChange={(event) => setOrderForm((current) => ({ ...current, actualQuantity: event.target.value }))} />
              <Input label="Client unit price" type="number" step="0.01" value={orderForm.clientUnitPrice} onChange={(event) => setOrderForm((current) => ({ ...current, clientUnitPrice: event.target.value }))} />
              <Input label="Supplier unit price" type="number" step="0.01" value={orderForm.supplierUnitPrice} onChange={(event) => setOrderForm((current) => ({ ...current, supplierUnitPrice: event.target.value }))} />
              <Select label="Currency" value={orderForm.currency} onChange={(event) => setOrderForm((current) => ({ ...current, currency: event.target.value }))}><option value="USD">USD</option></Select>
              <Select label="Assigned sourcing user" value={orderForm.sourcingUserId} onChange={(event) => setOrderForm((current) => ({ ...current, sourcingUserId: event.target.value }))}>
                {walkthroughUsers.filter((user) => user.role === "Sourcing").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </Select>
            </div>
            <TextArea label="Description" rows={4} value={orderForm.description} onChange={(event) => setOrderForm((current) => ({ ...current, description: event.target.value }))} className="mt-4" />
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreateOrder(false)}>Cancel</Button>
              <Button onClick={createOrder}>Submit order</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === "undefined") return null;
    const storedSession = window.localStorage.getItem(SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  });
  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window === "undefined") return defaultState;
    const storedState = window.localStorage.getItem(STORAGE_KEY);
    return storedState ? JSON.parse(storedState) : defaultState;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const handleSignIn = (user: UserRecord) => {
    const nextSession = { user };
    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  };

  const handleSignOut = () => {
    setSession(null);
    window.localStorage.removeItem(SESSION_KEY);
  };

  if (!session) {
    return <SignInScreen onSignIn={handleSignIn} />;
  }

  return <DashboardScreen session={session} appState={appState} setAppState={setAppState} onSignOut={handleSignOut} />;
}
