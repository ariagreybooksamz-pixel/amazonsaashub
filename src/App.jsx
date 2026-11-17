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

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

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

const getVisibleOrders = (role, supplierId, orders) => {
  if (role === 'operations') return orders;
  if (role === 'sourcing') return orders.filter((order) => order.status !== 'Matched');
  if (role === 'supplier') return orders.filter((order) => order.supplierId === supplierId);
  return [];
};

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
    const targetRoute = session.isAuthenticated ? `/workspace/${session.role}` : '/';
    navigate(targetRoute, { replace: true });
  }, [session, navigate]);

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
          <button className="primary-button" type="button" onClick={() => window.location.assign('/signin')}>Sign In</button>
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
              <button className="primary-button large" type="button" onClick={() => window.location.assign('/signin')}>
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

  const activeView = location.pathname.endsWith('/approvals')
    ? 'approvals'
    : location.pathname.endsWith('/reports')
      ? 'reports'
      : 'workspace';

  const visibleOrders = useMemo(() => getVisibleOrders(session.role, session.supplierId, orders), [session, orders]);
  const clientMap = Object.fromEntries(clientCatalog.map((client) => [client.id, client]));
  const supplierMap = Object.fromEntries(supplierCatalog.map((supplier) => [supplier.id, supplier]));

  const approvalEligible = approvalQueue.filter((quote) => quote.eligible && quote.supplierId);
  const totalApprovedValue = visibleOrders.reduce((sum, order) => sum + Number(order.approvedCost || 0), 0);
  const openCases = visibleOrders.filter((order) => order.status !== 'Matched').length;

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

      const nextOrders = orders.map((order) => {
        if (order.id === quote.orderId) {
          return {
            ...order,
            status: 'Approved',
            supplierReceiptLabel: order.supplierReceipt > 0 ? 'Confirmed' : 'Pending confirmation',
            workflowNote: `Approved by Operations on ${new Date().toISOString().slice(0, 10)}. Supplier quote accepted.`,
          };
        }
        return order;
      });

      setOrders(nextOrders);
      setApprovalQueue((current) =>
        current.filter((item) => item.id !== quote.id),
      );
      setStatusMessage({ type: 'success', text: `Approval saved for ${quote.orderId}. The order was refreshed.` });
      navigate(`/workspace/${session.role}`);
    } catch (error) {
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
          <div className="order-badge-col">
            <strong>{order.id}</strong>
            <span>{client?.name}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Supplier</span>
            <span>{supplier?.name}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Qty</span>
            <span>{order.qty}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Approved</span>
            <span>{currency.format(order.approvedCost)}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Sourcing</span>
            <span>{currency.format(order.sourcingReport)}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Transfer</span>
            <span>{currency.format(order.verifiedTransfer)}</span>
          </div>
          <div className="order-badge-col">
            <span className="row-label">Receipt</span>
            <span>{order.supplierReceipt > 0 ? currency.format(order.supplierReceipt) : 'Pending confirmation'}</span>
          </div>
          <div className="order-badge-col status-col">
            <span className="row-label">Status</span>
            {renderStatusPill(order.status)}
          </div>
        </div>

        <div className="order-row-actions">
          {isOperations && isDiscrepancy ? (
            <button type="button" className="secondary-button" onClick={() => setSelectedOrder(order)}>
              Review discrepancy
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={() => setSelectedOrder(order)}>
              View order
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
          <button type="button" className={`nav-button ${activeView === 'approvals' ? 'active' : ''}`} onClick={() => navigate(`/workspace/${session.role}/approvals`)}>
            Approvals
          </button>
          <button type="button" className={`nav-button ${activeView === 'reports' ? 'active' : ''}`} onClick={() => navigate(`/workspace/${session.role}/reports`)}>
            Reports
          </button>
        </nav>

        <div className="side-panel">
          <h4>Operations</h4>
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

        {activeView === 'workspace' && (
          <>
            <section className="stats-grid">
              <article className="stat-card">
                <span>Total orders</span>
                <strong>{visibleOrders.length}</strong>
              </article>
              <article className="stat-card">
                <span>Open cases</span>
                <strong>{openCases}</strong>
              </article>
              <article className="stat-card">
                <span>Approved value</span>
                <strong>{currency.format(totalApprovedValue)}</strong>
              </article>
            </section>

            <section className="cards-row">
              <div className="info-card wide-panel">
                <div className="card-header">
                  <h3>Order Pipeline</h3>
                  <span className="badge">Review queue</span>
                </div>
                <div className="orders-table">
                  {visibleOrders.map((order) => renderOrderRow(order))}
                </div>
              </div>

              <div className="info-card narrow-panel">
                <div className="card-header">
                  <h3>Client Records</h3>
                  <span className="badge">Fictional</span>
                </div>
                <ul className="client-list">
                  {clientCatalog.map((client) => (
                    <li key={client.id}>
                      <strong>{client.name}</strong>
                      <span>{client.segment}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-header secondary-space">
                  <h3>Suppliers</h3>
                  <span className="badge">Private</span>
                </div>
                <ul className="client-list">
                  {supplierCatalog.map((supplier) => (
                    <li key={supplier.id}>
                      <strong>{supplier.name}</strong>
                      <span>{supplier.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}

        {activeView === 'approvals' && (
          <section className="content-panel approvals-panel">
            <div className="card-header">
              <h3>Supplier approvals</h3>
              <span className="badge">{approvalEligible.length} awaiting review</span>
            </div>
            {approvalEligible.length === 0 ? (
              <div className="empty-state">No supplier-confirmed quotes are awaiting approval.</div>
            ) : (
              <div className="approval-list">
                {approvalEligible.map((quote) => (
                  <div key={quote.id} className="approval-card">
                    <div>
                      <div className="approval-header">
                        <strong>{quote.id}</strong>
                        <span className="status-pill needs-review">{quote.status}</span>
                      </div>
                      <p>{quote.clientName}</p>
                      <p>{quote.supplierName}</p>
                    </div>
                    <div className="approval-metrics">
                      <div>
                        <span>Order</span>
                        <strong>{quote.orderId}</strong>
                      </div>
                      <div>
                        <span>Approved cost</span>
                        <strong>{currency.format(quote.amount)}</strong>
                      </div>
                      <div>
                        <span>Quote date</span>
                        <strong>{quote.quoteDate}</strong>
                      </div>
                    </div>
                    <p className="quote-note">{quote.note}</p>
                    {session.role === 'operations' ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleApproveQuote(quote)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Saving...' : 'Approve supplier terms'}
                      </button>
                    ) : (
                      <button type="button" className="secondary-button" disabled>
                        Sourcing cannot approve supplier terms
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeView === 'reports' && (
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
                  <span>{currency.format(order.approvedCost)}</span>
                  <span>{currency.format(order.sourcingReport)}</span>
                  <span>{currency.format(order.verifiedTransfer)}</span>
                  <span>{order.supplierReceipt > 0 ? currency.format(order.supplierReceipt) : 'Pending confirmation'}</span>
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
                <p><strong>Approved cost:</strong> {currency.format(selectedOrder.approvedCost)}</p>
              </div>
              <div>
                <p><strong>Sourcing report:</strong> {currency.format(selectedOrder.sourcingReport)}</p>
                <p><strong>Verified transfer:</strong> {currency.format(selectedOrder.verifiedTransfer)}</p>
                <p><strong>Supplier receipt:</strong> {selectedOrder.supplierReceipt > 0 ? currency.format(selectedOrder.supplierReceipt) : 'Pending confirmation'}</p>
                <p><strong>Status:</strong> {renderStatusPill(selectedOrder.status)}</p>
              </div>
            </div>

            {selectedOrder.status === 'Needs review' && (
              <div className="variance-box detail-box">
                <div className="variance-item">
                  <span>Paid above approved cost</span>
                  <strong>{currency.format(selectedOrder.approvedCost > 0 ? selectedOrder.sourcingReport - selectedOrder.approvedCost : 0)}</strong>
                </div>
                <div className="variance-item">
                  <span>Gap between verified transfer and supplier receipt</span>
                  <strong>{currency.format(Math.abs(selectedOrder.verifiedTransfer - selectedOrder.supplierReceipt))}</strong>
                </div>
                <div className="variance-item">
                  <span>Sourcing report vs transfer</span>
                  <strong>{currency.format(Math.abs(selectedOrder.sourcingReport - selectedOrder.verifiedTransfer))}</strong>
                </div>
              </div>
            )}

            <div className="history-card">
              <h4>Case history</h4>
              <p>{selectedOrder.workflowNote}</p>
              {selectedOrder.varianceChecks ? (
                <ul className="history-list">
                  {selectedOrder.varianceChecks.map((check) => (
                    <li key={check.label}>{check.label}: {currency.format(check.amount)}</li>
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
