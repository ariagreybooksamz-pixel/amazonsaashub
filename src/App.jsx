import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  accountCatalog,
  clientCatalog,
  privateNarrative,
  purchaseOrders,
  roleConfig,
  supplierCatalog,
} from './data/walkthroughData';

const sessionStorageKey = 'mps-sourcing-hub-user';
const ordersStorageKey = 'mps-sourcing-orders';
const approvalStorageKey = 'mps-sourcing-approvals';

const formatMoney = (amount, currencyCode = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(Number(amount || 0));

const buildApprovalQueue = () => [
  {
    id: 'QUOTE-104',
    orderId: 'MPS-1002',
    supplierId: 'supplier-northfield',
    supplierName: 'Northfield Packaging',
    clientName: 'Harbor Foods Co.',
    status: 'Awaiting approval',
    eligible: true,
    amount: 2000,
    quoteDate: '2026-11-17',
    note: 'Supplier has confirmed the price and quantity for this split shipment.',
  },
];

const buildDefaultOrders = () =>
  purchaseOrders.map((order) => ({
    ...order,
    clientAmountDue: order.clientAmountDue ?? order.approvedCost ?? order.sourcingReport ?? 0,
    clientCurrency: order.clientCurrency ?? 'USD',
    supplierQuote: order.supplierQuote ?? null,
    supplierQuoteStatus: order.supplierQuoteStatus ?? 'awaiting_quote',
    supplierQuoteNeedsApproval: order.supplierQuoteNeedsApproval ?? false,
    approvedSupplierTotal: order.approvedSupplierTotal ?? null,
    approvedSupplierCurrency: order.approvedSupplierCurrency ?? null,
    approvedBy: order.approvedBy ?? null,
    approvedAt: order.approvedAt ?? null,
    supplierReceiptLabel: order.supplierReceipt > 0 ? 'Confirmed' : 'Pending confirmation',
  }));

const getStoredOrders = () => {
  const raw = localStorage.getItem(ordersStorageKey);
  if (!raw) {
    return buildDefaultOrders();
  }

  try {
    return JSON.parse(raw);
  } catch {
    return buildDefaultOrders();
  }
};

const getStoredApprovals = () => {
  const raw = localStorage.getItem(approvalStorageKey);
  if (!raw) {
    return buildApprovalQueue();
  }

  try {
    return JSON.parse(raw);
  } catch {
    return buildApprovalQueue();
  }
};

const getVisibleOrders = (role, supplierId, clientId, orders) => {
  if (role === 'operations') return orders;
  if (role === 'sourcing') return orders.filter((order) => order.status !== 'Matched');
  if (role === 'supplier') return orders.filter((order) => order.supplierId === supplierId);
  if (role === 'client') return orders.filter((order) => order.clientId === clientId);
  return [];
};

const getClientVisibleOrders = (clientId, orders) =>
  orders
    .filter((order) => order.clientId === clientId)
    .map((order) => ({
      id: order.id,
      title: order.title,
      qty: order.qty,
      clientAmountDue: order.clientAmountDue ?? order.approvedCost ?? order.sourcingReport ?? 0,
      clientCurrency: order.clientCurrency ?? 'USD',
    }));

const getActionState = (status) => {
  if (status === 'Matched') return 'matched';
  if (status === 'Needs review') return 'needs-review';
  if (status === 'Report mismatch') return 'report-mismatch';
  if (status === 'Pending supplier receipt') return 'pending';
  if (status === 'Partial shipment') return 'partial';
  if (status === 'Approved') return 'approved';
  return 'default';
};

function App() {
  const location = useLocation();
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(sessionStorageKey);
    return raw ? JSON.parse(raw) : null;
  });
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [approvalQueue, setApprovalQueue] = useState(() => getStoredApprovals());

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(approvalStorageKey, JSON.stringify(approvalQueue));
  }, [approvalQueue]);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(sessionStorageKey);
      return;
    }

    localStorage.setItem(sessionStorageKey, JSON.stringify(session));

    const currentPath = location.pathname;
    const isWorkspacePath = /^\/workspace\/[^/]+(?:\/(approvals|reports))?$/.test(currentPath);
    const isLandingPath = currentPath === '/' || currentPath === '/signin';

    if (isLandingPath || !isWorkspacePath) {
      navigate(`/workspace/${session.role}`, { replace: true });
    }
  }, [session, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage setSession={setSession} />} />
      <Route path="/signin" element={<HomePage setSession={setSession} />} />
      <Route
        path="/workspace/:role"
        element={
          session && session.isAuthenticated ? (
            <AuthenticatedDashboard
              session={session}
              orders={orders}
              setOrders={setOrders}
              approvalQueue={approvalQueue}
              setApprovalQueue={setApprovalQueue}
              onSignOut={() => setSession(null)}
            />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/workspace/:role/approvals"
        element={
          session && session.isAuthenticated ? (
            <AuthenticatedDashboard
              session={session}
              orders={orders}
              setOrders={setOrders}
              approvalQueue={approvalQueue}
              setApprovalQueue={setApprovalQueue}
              onSignOut={() => setSession(null)}
            />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/workspace/:role/reports"
        element={
          session && session.isAuthenticated ? (
            <AuthenticatedDashboard
              session={session}
              orders={orders}
              setOrders={setOrders}
              approvalQueue={approvalQueue}
              setApprovalQueue={setApprovalQueue}
              onSignOut={() => setSession(null)}
            />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomePage({ setSession }) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = (event) => {
    event.preventDefault();
    setLoading(true);
    const user = accountCatalog.find(
      (candidate) =>
        candidate.email.toLowerCase() === loginData.email.trim().toLowerCase() && candidate.password === loginData.password,
    );

    setTimeout(() => {
      if (!user) {
        setError('Invalid invite-only credentials. Contact the workspace administrator for access.');
        setLoading(false);
        return;
      }

      setError('');
      setSession({ ...user, isAuthenticated: true });
      setLoading(false);
    }, 300);
  };

  return (
    <div className="page-shell light-shell">
      <header className="topbar public-topbar">
        <div className="brand-wrap">
          <div className="brand-mark">MPS</div>
          <div>
            <div className="brand-name">Sourcing Hub</div>
            <div className="brand-subtitle">by Area71</div>
          </div>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#contacts">Contacts</a>
          <button className="primary-button" type="button" onClick={() => navigate('/signin')}>Sign In</button>
        </nav>
      </header>

      <main className="landing-page">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Private management review</span>
            <h1>Operations visibility without public demo or trial prompts.</h1>
            <p>
              Invite-only access for the management walkthrough, with supplier, sourcing, and operations workstreams separated by role.
            </p>
            <div className="cta-row">
              <button className="primary-button large" type="button" onClick={() => navigate('/signin')}>
                Sign In
              </button>
            </div>
          </div>

          <div className="login-panel" id="login-panel">
            <div className="panel-header">
              <span className="status-dot" />
              Invite-only access
            </div>
            <form onSubmit={signIn} className="login-form">
              <label>
                Email
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                  placeholder="name@company.com"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {error ? <div className="error-banner">{error}</div> : null}
              <button type="submit" className="primary-button full-width" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </section>

        <section className="feature-grid" id="features">
          <article>
            <h3>Operations visibility</h3>
            <p>Approve supplier terms, reconcile transfers, and review discrepancies across the order lifecycle.</p>
          </article>
          <article>
            <h3>Sourcing control</h3>
            <p>Review assigned orders, submit purchase requests, and escalate mismatches before approval.</p>
          </article>
          <article>
            <h3>Supplier accountability</h3>
            <p>Confirm pricing, quantities, shipments, and receipts inside the buyer-specific portal.</p>
          </article>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading">
            <span className="eyebrow">Current walkthrough</span>
            <h2>Three workspaces with clearly separated permissions</h2>
          </div>
          <div className="workspace-list">
            {Object.entries(roleConfig).map(([key, config]) => (
              <div className="workspace-card" key={key}>
                <div className="workspace-role">{config.label}</div>
                <h3>{config.title}</h3>
                <p>{config.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contacts">
        <div>
          <strong>MPS Sourcing Hub</strong>
          <span>Private management walkthrough</span>
        </div>
        <div>{privateNarrative.note}</div>
      </footer>
    </div>
  );
}

function AuthenticatedDashboard({
  session,
  orders,
  setOrders,
  approvalQueue,
  setApprovalQueue,
  onSignOut,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: 'info', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseDraft, setPurchaseDraft] = useState({
    clientId: clientCatalog[0]?.id ?? '',
    supplierId: supplierCatalog[0]?.id ?? '',
    title: 'Seasonal replenishment',
    qty: 100,
    amountDue: 850,
    currency: 'USD',
  });
  const [quoteDrafts, setQuoteDrafts] = useState({});

  const normalizedPath = location.pathname.replace(/\/+$/, '');
  const activeView = normalizedPath.includes('/approvals')
    ? 'approvals'
    : normalizedPath.includes('/reports')
      ? 'reports'
      : 'workspace';

  useEffect(() => {
    if (session.role === 'client' && (activeView === 'approvals' || activeView === 'reports')) {
      navigate(`/workspace/${session.role}`, { replace: true });
    }
  }, [session.role, activeView, navigate]);

  const visibleOrders = useMemo(
    () => getVisibleOrders(session.role, session.supplierId, session.clientId, orders),
    [session, orders],
  );
  const clientVisibleOrders = useMemo(
    () => getClientVisibleOrders(session.clientId, orders),
    [session.clientId, orders],
  );
  const clientMap = Object.fromEntries(clientCatalog.map((client) => [client.id, client]));
  const supplierMap = Object.fromEntries(supplierCatalog.map((supplier) => [supplier.id, supplier]));

  const approvalEligible = approvalQueue.filter((quote) => quote.eligible && quote.supplierId);
  const approvalOrders = useMemo(
    () => orders.filter((order) => order.supplierQuote && order.supplierQuoteStatus !== 'approved'),
    [orders],
  );
  const totalApprovedValue = visibleOrders.reduce((sum, order) => sum + Number(order.approvedCost || order.clientAmountDue || 0), 0);
  const openCases = visibleOrders.filter((order) => order.status !== 'Matched').length;

  const handleCreatePurchaseOrder = (event) => {
    event.preventDefault();

    const qty = Number(purchaseDraft.qty);
    const amountDue = Number(purchaseDraft.amountDue);

    if (!purchaseDraft.clientId || !purchaseDraft.supplierId || !purchaseDraft.title || !qty || !amountDue) {
      setStatusMessage({ type: 'error', text: 'Provide a client, supplier, product, quantity, and client amount due.' });
      return;
    }

    const orderId = `MPS-${Date.now().toString().slice(-5)}`;
    const nextOrder = {
      id: orderId,
      clientId: purchaseDraft.clientId,
      supplierId: purchaseDraft.supplierId,
      title: purchaseDraft.title,
      status: 'Pending supplier quote',
      qty,
      unitPrice: Number((amountDue / qty).toFixed(2)) || 0,
      approvedCost: amountDue,
      clientAmountDue: amountDue,
      clientCurrency: purchaseDraft.currency,
      sourcingReport: amountDue,
      verifiedTransfer: 0,
      supplierReceipt: 0,
      supplierQuote: null,
      supplierQuoteStatus: 'awaiting_quote',
      workflowNote: 'Sourcing saved the purchase request and client-facing amount due. Awaiting supplier quote.',
      actionLabel: 'Awaiting quote',
    };

    setOrders((current) => [nextOrder, ...current]);
    setStatusMessage({ type: 'success', text: `Purchase order ${orderId} was saved for ${clientMap[purchaseDraft.clientId]?.name}.` });
    setPurchaseDraft({
      clientId: clientCatalog[0]?.id ?? '',
      supplierId: supplierCatalog[0]?.id ?? '',
      title: 'Seasonal replenishment',
      qty: 100,
      amountDue: 850,
      currency: 'USD',
    });
  };

  const handleSubmitSupplierQuote = (event, order) => {
    event.preventDefault();

    const draft = quoteDrafts[order.id] || {};
    const unitCost = Number(draft.unitCost || 0);
    const quoteCurrency = draft.currency || 'USD';

    if (!unitCost || unitCost <= 0) {
      setStatusMessage({ type: 'error', text: 'Enter a valid supplier unit cost before submitting the quote.' });
      return;
    }

    const quoteTotal = Number((unitCost * Number(order.qty || 0)).toFixed(2));
    const submittedAt = new Date().toISOString();

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              supplierQuote: {
                id: `QUOTE-${Date.now().toString().slice(-5)}`,
                unitCost,
                currency: quoteCurrency,
                total: quoteTotal,
                submittedBy: session.name,
                submittedAt,
                note: draft.note || 'Supplier quote submitted for approval.',
              },
              supplierQuoteStatus: 'pending',
              supplierQuoteNeedsApproval: true,
              status: 'Awaiting supplier approval',
              workflowNote: `Supplier quote submitted on ${submittedAt.slice(0, 10)}. Client amount due remains unchanged.`,
            }
          : item,
      ),
    );

    setStatusMessage({ type: 'success', text: `Supplier quote for ${order.id} submitted. Operations can now approve or return it.` });
  };

  const handleQuoteDecision = (order, decision) => {
    const quote = order.supplierQuote;
    if (!quote) {
      return;
    }

    setOrders((current) =>
      current.map((item) => {
        if (item.id !== order.id) {
          return item;
        }

        const approvedAt = new Date().toISOString();

        if (decision === 'approve') {
          return {
            ...item,
            supplierQuoteStatus: 'approved',
            approvedSupplierTotal: quote.total,
            approvedSupplierCurrency: quote.currency,
            approvedBy: session.name,
            approvedAt,
            status: 'Approved',
            workflowNote: `Approved by ${session.name} on ${approvedAt.slice(0, 10)}. Supplier quote total accepted for ${quote.currency} ${quote.total}.`,
          };
        }

        return {
          ...item,
          supplierQuoteStatus: 'returned',
          supplierQuoteNeedsApproval: true,
          quoteCorrectionNote: `Returned for correction by ${session.name} on ${approvedAt.slice(0, 10)}.`,
          status: 'Needs review',
          workflowNote: `Supplier quote returned for correction by ${session.name}. Client amount due remains unchanged until a new quote is approved.`,
        };
      }),
    );

    setStatusMessage({
      type: decision === 'approve' ? 'success' : 'error',
      text: decision === 'approve'
        ? `Quote for ${order.id} approved by ${session.name}.`
        : `Quote for ${order.id} returned for correction.`,
    });
  };

  const handleApproveQuote = async (quote) => {
    if (session.role !== 'operations') {
      setStatusMessage({ type: 'error', text: 'Only the Operations team can approve supplier terms.' });
      return;
    }

    if (!quote || !quote.eligible) {
      setStatusMessage({ type: 'error', text: 'This supplier quote is not eligible for approval.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'Saving approval...' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));

      setOrders((current) =>
        current.map((item) => {
          if (item.id !== quote.orderId) {
            return item;
          }

          return {
            ...item,
            status: 'Approved',
            supplierQuoteStatus: 'approved',
            approvedSupplierTotal: item.supplierQuote?.total ?? item.approvedCost,
            approvedSupplierCurrency: item.supplierQuote?.currency || 'USD',
            approvedBy: session.name,
            approvedAt: new Date().toISOString(),
            supplierReceiptLabel: item.supplierReceipt > 0 ? 'Confirmed' : 'Pending confirmation',
            workflowNote: `Approved by Operations on ${new Date().toISOString().slice(0, 10)}. Supplier quote accepted. Client amount due unchanged.`,
          };
        }),
      );

      setApprovalQueue((current) => current.filter((item) => item.id !== quote.id));
      setStatusMessage({ type: 'success', text: `Approval saved for ${quote.orderId}. The order was refreshed.` });
      navigate(`/workspace/${session.role}`);
    } catch {
      setStatusMessage({ type: 'error', text: 'Approval failed. Please retry or contact the admin.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = () => {
    setStatusMessage({ type: 'info', text: 'Signing out...' });
    onSignOut();
  };

  const renderStatusPill = (status) => <span className={`status-pill ${getActionState(status)}`}>{status}</span>;

  const renderOrderRow = (order) => {
    const client = clientMap[order.clientId];
    const supplier = supplierMap[order.supplierId];
    const isOperations = session.role === 'operations';
    const isDiscrepancy = order.status === 'Needs review' || order.status === 'Report mismatch' || order.status === 'Partial shipment';

    return (
      <div className="order-row" key={order.id}>
        <div className="order-row-main">
          <div className="order-badge-col order-id-col">
            <span className="row-label">Order</span>
            <strong>{order.id}</strong>
            <span>{client?.name}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Supplier</span>
            <span>{supplier?.name}</span>
          </div>
          <div className="order-badge-col compact-col">
            <span className="row-label">Qty</span>
            <span>{order.qty}</span>
          </div>
          <div className="order-badge-col status-col">
            <span className="row-label">Status</span>
            {renderStatusPill(order.status)}
          </div>
        </div>

        <div className="order-row-actions">
          {isOperations && isDiscrepancy ? (
            <button type="button" className="secondary-button" onClick={() => setSelectedOrder(order)}>
              Review
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={() => setSelectedOrder(order)}>
              Open
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-shell light-dashboard">
      <aside className="sidebar light-sidebar">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-mark">MPS</div>
          <div>
            <div className="brand-name">Sourcing Hub</div>
            <div className="brand-subtitle">by Area71</div>
          </div>
        </div>

        <div className="profile-card">
          <strong>{session.name}</strong>
          <span>{roleConfig[session.role].label}</span>
          <small>{session.workspace}</small>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <button type="button" className={`nav-button ${activeView === 'workspace' ? 'active' : ''}`} onClick={() => navigate(`/workspace/${session.role}`)}>
            Workspace
          </button>
          {session.role !== 'client' && (
            <button type="button" className={`nav-button ${activeView === 'approvals' ? 'active' : ''}`} onClick={() => navigate(`/workspace/${session.role}/approvals`)}>
              Approvals
            </button>
          )}
          {session.role !== 'client' && (
            <button type="button" className={`nav-button ${activeView === 'reports' ? 'active' : ''}`} onClick={() => navigate(`/workspace/${session.role}/reports`)}>
              Reports
            </button>
          )}
        </nav>

        <div className="side-panel">
          <h4>{session.role === 'client' ? 'Client access' : 'Operations'}</h4>
          <p>{privateNarrative.walkthroughScope}</p>
        </div>

        <button className="secondary-button full-width" type="button" onClick={handleSignOut}>Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <div>
            <span className="eyebrow">{roleConfig[session.role].label}</span>
            <h1>{roleConfig[session.role].title}</h1>
          </div>
          <div className="header-chips">
            <span className="chip">{session.location}</span>
            <span className="chip">Private walkthrough</span>
          </div>
        </header>

        {statusMessage.text ? (
          <div className={`banner ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        ) : null}

        {session.role === 'sourcing' && activeView === 'workspace' && (
          <>
            <section className="content-panel approvals-panel">
              <div className="card-header">
                <h3>Create purchase order</h3>
                <span className="badge">Sourcing form</span>
              </div>
              <form className="login-form" onSubmit={handleCreatePurchaseOrder}>
                <div className="field-grid">
                  <label>
                    Client name
                    <select value={purchaseDraft.clientId} onChange={(event) => setPurchaseDraft((current) => ({ ...current, clientId: event.target.value }))}>
                      {clientCatalog.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Supplier name
                    <select value={purchaseDraft.supplierId} onChange={(event) => setPurchaseDraft((current) => ({ ...current, supplierId: event.target.value }))}>
                      {supplierCatalog.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="field-grid">
                  <label>
                    Product name
                    <input value={purchaseDraft.title} onChange={(event) => setPurchaseDraft((current) => ({ ...current, title: event.target.value }))} />
                  </label>
                  <label>
                    Quantity
                    <input type="number" min="1" value={purchaseDraft.qty} onChange={(event) => setPurchaseDraft((current) => ({ ...current, qty: Number(event.target.value) }))} />
                  </label>
                </div>
                <div className="field-grid">
                  <label>
                    Client amount due
                    <input type="number" min="0" step="0.01" value={purchaseDraft.amountDue} onChange={(event) => setPurchaseDraft((current) => ({ ...current, amountDue: Number(event.target.value) }))} />
                  </label>
                  <label>
                    Currency
                    <select value={purchaseDraft.currency} onChange={(event) => setPurchaseDraft((current) => ({ ...current, currency: event.target.value }))}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="primary-button full-width">Save purchase order</button>
              </form>
            </section>

            <section className="content-panel approvals-panel">
              <div className="card-header">
                <h3>Saved purchase orders</h3>
                <span className="badge">{visibleOrders.length} records</span>
              </div>

              {visibleOrders.length === 0 ? (
                <div className="empty-state">No purchase orders have been saved yet.</div>
              ) : (
                <div className="sourcing-table-wrap">
                  <div className="sourcing-table">
                    <div className="sourcing-table-header">
                      <span>Order</span>
                      <span>Client</span>
                      <span>Supplier</span>
                      <span>Product</span>
                      <span>Qty</span>
                      <span>Amount</span>
                      <span>Status</span>
                    </div>

                    {visibleOrders.map((order) => (
                      <div className="sourcing-table-row" key={order.id}>
                        <span>{order.id}</span>
                        <span>{clientMap[order.clientId]?.name || 'Unknown client'}</span>
                        <span>{supplierMap[order.supplierId]?.name || 'Unknown supplier'}</span>
                        <span>{order.title}</span>
                        <span>{order.qty}</span>
                        <span>{formatMoney(order.clientAmountDue ?? order.approvedCost ?? 0, order.clientCurrency || 'USD')}</span>
                        <span>{renderStatusPill(order.status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {session.role === 'supplier' && activeView === 'workspace' && (
          <section className="content-panel approvals-panel">
            <div className="card-header">
              <h3>Supplier quote submissions</h3>
              <span className="badge">Assigned orders</span>
            </div>
            <div className="approval-list">
              {visibleOrders.map((order) => (
                <div key={order.id} className="approval-card">
                  <div className="approval-header">
                    <strong>{order.id}</strong>
                    <span className="status-pill needs-review">{order.supplierQuoteStatus || 'awaiting_quote'}</span>
                  </div>
                  <div className="approval-metrics">
                    <div>
                      <span>Product</span>
                      <strong>{order.title}</strong>
                    </div>
                    <div>
                      <span>Qty</span>
                      <strong>{order.qty}</strong>
                    </div>
                  </div>
                  {order.supplierQuote ? (
                    <div className="approval-metrics">
                      <div>
                        <span>Unit cost</span>
                        <strong>{order.supplierQuote.currency} {formatMoney(order.supplierQuote.unitCost, order.supplierQuote.currency)}</strong>
                      </div>
                      <div>
                        <span>Quote total</span>
                        <strong>{order.supplierQuote.currency} {formatMoney(order.supplierQuote.total, order.supplierQuote.currency)}</strong>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(event) => handleSubmitSupplierQuote(event, order)} className="supplier-form">
                      <div className="field-grid">
                        <label>
                          Your price
                          <input type="number" min="0" step="0.01" value={quoteDrafts[order.id]?.unitCost || ''} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [order.id]: { ...(current[order.id] || {}), unitCost: event.target.value } }))} />
                        </label>
                        <label>
                          Currency
                          <select value={quoteDrafts[order.id]?.currency || 'USD'} onChange={(event) => setQuoteDrafts((current) => ({ ...current, [order.id]: { ...(current[order.id] || {}), currency: event.target.value } }))}>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </label>
                      </div>
                      <button type="submit" className="primary-button full-width">Submit quote</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {session.role === 'client' && activeView === 'workspace' && (
          <section className="content-panel approvals-panel">
            <div className="card-header">
              <h3>My orders</h3>
              <span className="badge">Private client view</span>
            </div>
            <div className="approval-list">
              {clientVisibleOrders.map((order) => (
                <div key={order.id} className="approval-card">
                  <div className="approval-header">
                    <strong>{order.id}</strong>
                    <span className="status-pill matched">Order</span>
                  </div>
                  <div className="approval-metrics">
                    <div>
                      <span>Quantity</span>
                      <strong>{order.qty} units</strong>
                    </div>
                    <div>
                      <span>Amount due</span>
                      <strong>{order.clientCurrency || 'USD'} {formatMoney(order.clientAmountDue || 0, order.clientCurrency || 'USD')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'workspace' && session.role === 'operations' && (
          <section className="content-panel approvals-panel">
            <div className="card-header">
              <h3>Operations queue</h3>
              <span className="badge">{visibleOrders.length} active</span>
            </div>
            <div className="orders-table">
              {visibleOrders.map((order) => renderOrderRow(order))}
            </div>
          </section>
        )}

        {activeView === 'approvals' && session.role === 'operations' && (
          <section className="content-panel approvals-panel">
            <div className="card-header">
              <h3>Supplier approvals</h3>
              <span className="badge">{approvalOrders.length} awaiting review</span>
            </div>
            {approvalOrders.length === 0 ? (
              <div className="empty-state">No supplier-confirmed quotes are awaiting approval.</div>
            ) : (
              <div className="approval-list">
                {approvalOrders.map((order) => (
                  <div key={order.id} className="approval-card">
                    <div>
                      <div className="approval-header">
                        <strong>{order.id}</strong>
                        <span className="status-pill needs-review">{order.supplierQuoteStatus}</span>
                      </div>
                      <p>{clientMap[order.clientId]?.name}</p>
                      <p>{supplierMap[order.supplierId]?.name}</p>
                    </div>
                    <div className="approval-metrics">
                      <div>
                        <span>Order qty</span>
                        <strong>{order.qty} units</strong>
                      </div>
                      <div>
                        <span>Quote total</span>
                        <strong>{order.supplierQuote.currency} {formatMoney(order.supplierQuote.total, order.supplierQuote.currency)}</strong>
                      </div>
                      <div>
                        <span>Submitted</span>
                        <strong>{new Date(order.supplierQuote.submittedAt).toLocaleDateString()}</strong>
                      </div>
                    </div>
                    <p className="quote-note">{order.supplierQuote.note}</p>
                    <div className="approval-actions">
                      <button type="button" className="primary-button" onClick={() => handleQuoteDecision(order, 'approve')}>
                        Approve quote
                      </button>
                      <button type="button" className="secondary-button" onClick={() => handleQuoteDecision(order, 'return')}>
                        Return for correction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeView === 'reports' && session.role === 'operations' && (
          <section className="content-panel reports-panel">
            <div className="card-header">
              <h3>Reconciliation report</h3>
              <span className="badge">Current data</span>
            </div>
            <div className="report-table">
              <div className="report-row report-header">
                <span>Order</span>
                <span>Approved</span>
                <span>Sourcing</span>
                <span>Transfer</span>
                <span>Supplier receipt</span>
                <span>Status</span>
              </div>
              {orders.map((order) => (
                <div className="report-row" key={order.id}>
                  <strong>{order.id}</strong>
                  <span>{formatMoney(order.approvedCost, order.clientCurrency || 'USD')}</span>
                  <span>{formatMoney(order.sourcingReport, order.clientCurrency || 'USD')}</span>
                  <span>{formatMoney(order.verifiedTransfer, order.clientCurrency || 'USD')}</span>
                  <span>{order.supplierReceipt > 0 ? formatMoney(order.supplierReceipt, order.clientCurrency || 'USD') : 'Pending confirmation'}</span>
                  {renderStatusPill(order.status)}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {selectedOrder ? (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="card-header modal-header">
              <div>
                <span className="eyebrow">Order detail</span>
                <h3>{selectedOrder.id}</h3>
              </div>
              <button type="button" className="secondary-button" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>

            <div className="order-modal-grid">
              <div>
                <p><strong>Client:</strong> {clientMap[selectedOrder.clientId]?.name}</p>
                <p><strong>Supplier:</strong> {supplierMap[selectedOrder.supplierId]?.name}</p>
                <p><strong>Title:</strong> {selectedOrder.title}</p>
                <p><strong>Quantity:</strong> {selectedOrder.qty} units</p>
                <p><strong>Amount due:</strong> {selectedOrder.clientCurrency || 'USD'} {formatMoney(selectedOrder.clientAmountDue ?? selectedOrder.approvedCost ?? 0, selectedOrder.clientCurrency || 'USD')}</p>
              </div>
              <div>
                <p><strong>Supplier quote:</strong> {selectedOrder.supplierQuote ? `${selectedOrder.supplierQuote.currency} ${formatMoney(selectedOrder.supplierQuote.total, selectedOrder.supplierQuote.currency)}` : 'Pending'}</p>
                <p><strong>Verified transfer:</strong> {formatMoney(selectedOrder.verifiedTransfer, selectedOrder.clientCurrency || 'USD')}</p>
                <p><strong>Supplier receipt:</strong> {selectedOrder.supplierReceipt > 0 ? formatMoney(selectedOrder.supplierReceipt, selectedOrder.clientCurrency || 'USD') : 'Pending confirmation'}</p>
                <p><strong>Status:</strong> {renderStatusPill(selectedOrder.status)}</p>
              </div>
            </div>

            {selectedOrder.status === 'Needs review' && (
              <div className="variance-box detail-box">
                <div className="variance-item">
                  <span>Paid above approved cost</span>
                  <strong>{formatMoney(selectedOrder.approvedCost > 0 ? selectedOrder.sourcingReport - selectedOrder.approvedCost : 0, selectedOrder.clientCurrency || 'USD')}</strong>
                </div>
                <div className="variance-item">
                  <span>Gap between verified transfer and supplier receipt</span>
                  <strong>{formatMoney(Math.abs(selectedOrder.verifiedTransfer - selectedOrder.supplierReceipt), selectedOrder.clientCurrency || 'USD')}</strong>
                </div>
                <div className="variance-item">
                  <span>Sourcing report vs transfer</span>
                  <strong>{formatMoney(Math.abs(selectedOrder.sourcingReport - selectedOrder.verifiedTransfer), selectedOrder.clientCurrency || 'USD')}</strong>
                </div>
              </div>
            )}

            <div className="history-card">
              <h4>Case history</h4>
              <p>{selectedOrder.workflowNote}</p>
              {selectedOrder.varianceChecks ? (
                <ul className="history-list">
                  {selectedOrder.varianceChecks.map((check) => (
                    <li key={check.label}>{check.label}: {formatMoney(check.amount, selectedOrder.clientCurrency || 'USD')}</li>
                  ))}
                </ul>
              ) : (
                <ul className="history-list">
                  <li>Supplier quote confirmed.</li>
                  <li>Matching transfer and reporting review complete.</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
