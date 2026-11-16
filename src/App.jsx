import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  accountCatalog,
  clientCatalog,
  privateNarrative,
  purchaseOrders,
  roleConfig,
  supplierCatalog,
} from './data/walkthroughData';

const storageKey = 'mps-sourcing-hub-user';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getVisibleOrders = (role, supplierId) => {
  if (role === 'operations') return purchaseOrders;
  if (role === 'sourcing') return purchaseOrders.filter((order) => order.status !== 'Matched');
  if (role === 'supplier') return purchaseOrders.filter((order) => order.supplierId === supplierId);
  return [];
};

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(session));
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
          session && session.isAuthenticated ? <AuthenticatedDashboard session={session} onSignOut={() => setSession(null)} /> : <Navigate to="/signin" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomePage({ setSession }) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const signIn = (event) => {
    event.preventDefault();
    const user = accountCatalog.find(
      (candidate) =>
        candidate.email.toLowerCase() === loginData.email.trim().toLowerCase() && candidate.password === loginData.password,
    );

    if (!user) {
      setError('Invalid invite-only credentials. Contact the workspace administrator for access.');
      return;
    }

    setError('');
    setSession({ ...user, isAuthenticated: true });
  };

  return (
    <div className="page-shell">
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
            <h1>Control sourcing approvals and supplier visibility from one workspace.</h1>
            <p>
              Invite-only access for the management walkthrough. Review operations, sourcing, and supplier workstreams without public trial prompts or self-signup flow.
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
              <button type="submit" className="primary-button full-width">Sign In</button>
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

function AuthenticatedDashboard({ session, onSignOut }) {
  const visibleOrders = useMemo(() => getVisibleOrders(session.role, session.supplierId), [session]);

  const supplierName =
    session.role === 'supplier'
      ? supplierCatalog.find((supplier) => supplier.id === session.supplierId)?.name || 'Supplier Portal'
      : 'Cross-supplier view';

  const clientMap = Object.fromEntries(clientCatalog.map((client) => [client.id, client]));
  const supplierMap = Object.fromEntries(supplierCatalog.map((supplier) => [supplier.id, supplier]));

  const totalSpend = visibleOrders.reduce((sum, order) => sum + Number(order.approvedCost || 0), 0);
  const openCases = visibleOrders.filter((order) => order.status !== 'Matched').length;

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
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

        <nav className="sidebar-nav">
          <button type="button" className="nav-button active">Workspace</button>
          <button type="button" className="nav-button">Approvals</button>
          <button type="button" className="nav-button">Reports</button>
        </nav>

        <div className="side-panel">
          <h4>Environment</h4>
          <p>{privateNarrative.walkthroughScope}</p>
        </div>

        <button className="secondary-button full-width" type="button" onClick={onSignOut}>Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <div>
            <span className="eyebrow">{roleConfig[session.role].label}</span>
            <h1>{roleConfig[session.role].title}</h1>
          </div>
          <div className="header-chips">
            <span className="chip">{session.location}</span>
            <span className="chip">{supplierName}</span>
          </div>
        </header>

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
            <strong>{currency.format(totalSpend)}</strong>
          </article>
        </section>

        <section className="cards-row">
          <div className="info-card wide">
            <div className="card-header">
              <h3>Order pipeline</h3>
              <span className="badge">{session.role === 'supplier' ? 'Assigned orders' : 'Review queue'}</span>
            </div>
            <div className="orders-list">
              {visibleOrders.map((order) => {
                const client = clientMap[order.clientId];
                const supplier = supplierMap[order.supplierId];
                const isOperationReview = session.role === 'operations' && order.status === 'Needs review';
                const canApprove = session.role === 'operations' && order.status !== 'Matched';

                return (
                  <div key={order.id} className="order-card">
                    <div className="order-topline">
                      <div>
                        <strong>{order.id}</strong>
                        <span>{client?.name}</span>
                      </div>
                      <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="order-title">{order.title}</p>
                    <div className="order-meta">
                      <span>{supplier?.name}</span>
                      <span>{order.qty} units</span>
                      <span>{currency.format(order.approvedCost)}</span>
                    </div>
                    <div className="order-detail-row">
                      <div>
                        <small>Sourcing report</small>
                        <strong>{currency.format(order.sourcingReport)}</strong>
                      </div>
                      <div>
                        <small>Verified transfer</small>
                        <strong>{currency.format(order.verifiedTransfer)}</strong>
                      </div>
                      <div>
                        <small>Supplier receipt</small>
                        <strong>{currency.format(order.supplierReceipt)}</strong>
                      </div>
                    </div>
                    {order.varianceChecks ? (
                      <div className="variance-box">
                        {order.varianceChecks.map((check) => (
                          <div className="variance-item" key={check.label}>
                            <span>{check.label}</span>
                            <strong>{currency.format(check.amount)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p className="workflow-note">{order.workflowNote}</p>
                    {session.role === 'operations' && (
                      <button type="button" className="primary-button narrow" disabled={!canApprove}>
                        {canApprove ? 'Approve supplier terms' : 'Review complete'}
                      </button>
                    )}
                    {session.role === 'sourcing' && (
                      <button type="button" className="primary-button narrow">
                        {order.status === 'Needs review' ? 'Submit report' : 'Create purchase request'}
                      </button>
                    )}
                    {session.role === 'supplier' && (
                      <button type="button" className="primary-button narrow">
                        {order.status === 'Pending supplier receipt' ? 'Submit receipt' : 'Confirm shipment'}
                      </button>
                    )}
                    {isOperationReview && <div className="review-callout">Needs review</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="info-card narrow">
            <div className="card-header">
              <h3>Client records</h3>
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
      </main>
    </div>
  );
}

export default App;
