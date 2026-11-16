import './App.css'

const stats = [
  { value: '4.8x', label: 'faster order cycles' },
  { value: '99.96%', label: 'platform uptime' },
  { value: '32%', label: 'lower support load' },
  { value: '14 days', label: 'average deployment time' },
]

const features = [
  {
    icon: '⚡',
    title: 'Unified operations',
    text: 'Bring inventory, fulfillment, support, and seller performance into one live command center.',
  },
  {
    icon: '🧠',
    title: 'AI-powered guidance',
    text: 'Surface customer sentiment, demand shifts, and pricing opportunities before they impact revenue.',
  },
  {
    icon: '📦',
    title: 'Fulfillment insight',
    text: 'Track last-mile performance, stock health, and outbound exceptions in a single operational view.',
  },
  {
    icon: '🔐',
    title: 'Secure by default',
    text: 'Role-based access, audit logs, and approval workflows keep every team aligned and compliant.',
  },
]

const integrations = ['Amazon Seller Central', 'Shopify', 'Slack', 'QuickBooks', 'ERP', 'CRM']

const plans = [
  {
    name: 'Launch',
    price: '$49',
    detail: 'for growing teams',
    features: ['3 storefronts', 'Smart alerts', 'Growth reports'],
    featured: false,
  },
  {
    name: 'Scale',
    price: '$129',
    detail: 'most popular',
    features: ['Unlimited dashboards', 'AI forecasting', 'Workflow automations'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    detail: 'for complex operations',
    features: ['Multi-region rollout', 'Advanced security', 'Dedicated onboarding'],
    featured: false,
  },
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <span>Amazon SaaS Hub</span>
        </div>
        <nav className="nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#customers">Customers</a>
        </nav>
        <button type="button" className="nav-button">
          Book demo
        </button>
      </header>

      <main>
        <section className="hero section-shell">
          <div className="hero-copy">
            <span className="eyebrow">Built for modern commerce teams</span>
            <h1>Turn operational complexity into a revenue advantage.</h1>
            <p className="subtitle">
              Amazon SaaS Hub connects fulfillment, merchandising, and customer support in one
              command center that keeps your growth engine moving.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button">
                Start free trial
              </button>
              <button type="button" className="secondary-button">
                See pricing
              </button>
            </div>
            <ul className="trust-row" aria-label="Trust statements">
              <li>Trusted by 2,500+ brands</li>
              <li>4.9/5 customer rating</li>
            </ul>
          </div>

          <div className="hero-visual" aria-label="Dashboard preview">
            <div className="dashboard-card main-card">
              <div className="card-header">
                <span className="chip success">Live</span>
                <span className="tiny-text">North America GMV</span>
              </div>
              <div className="total-block">
                <strong>$2.84M</strong>
                <span>+18.4% vs last month</span>
              </div>
              <div className="bars" aria-hidden="true">
                <span style={{ height: '32%' }} />
                <span style={{ height: '52%' }} />
                <span style={{ height: '46%' }} />
                <span style={{ height: '66%' }} />
                <span style={{ height: '78%' }} />
                <span style={{ height: '92%' }} />
              </div>
            </div>

            <div className="dashboard-card side-card">
              <span className="tiny-text">Inventory health</span>
              <strong>98.7%</strong>
              <div className="progress-track" aria-hidden="true">
                <span className="progress-bar" />
              </div>
             <ul>
                <li><span className="dot dot-blue" />Ready to ship: 72%</li>
                <li><span className="dot dot-orange" />Low stock: 11%</li>
             </ul>
            </div>
          </div>
        </section>

        <section className="stats section-shell" aria-label="Company metrics">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section id="features" className="features section-shell">
          <div className="section-label">Why teams choose us</div>
          <h2>Everything needed to run a faster, smarter storefront.</h2>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="solutions" className="solutions section-shell">
          <div className="section-copy">
            <span className="section-label">Connected workflow</span>
            <h2>Replace fragmented tools with a single operating system for commerce.</h2>
          </div>
          <div className="integration-panel">
            {integrations.map((integration) => (
              <span key={integration} className="integration-pill">
                {integration}
              </span>
            ))}
          </div>
        </section>

        <section id="pricing" className="pricing section-shell">
          <div className="section-label">Simple pricing</div>
          <h2>Choose the plan that matches your growth stage.</h2>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`price-card ${plan.featured ? 'featured' : ''}`}>
                <div className="plan-top">
                  <h3>{plan.name}</h3>
                  {plan.featured ? <span className="chip popular">Popular</span> : null}
                </div>
                <div className="price-line">
                  <strong>{plan.price}</strong>
                  <span>{plan.detail}</span>
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button type="button" className={plan.featured ? 'primary-button' : 'secondary-button'}>
                  {plan.featured ? 'Get started' : 'Choose plan'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="customers" className="testimonial section-shell">
          <blockquote>
            “Amazon SaaS Hub gave our team a real-time picture of inventory, conversion, and customer
            health. It replaced four tools and shortened our weekly operating cycle from 3 days to 1.”
          </blockquote>
          <div className="person">
            <div className="avatar">MA</div>
            <div>
              <strong>Maya Alvarez</strong>
              <span>VP of Operations, Northstar Commerce</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer section-shell">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <span>Amazon SaaS Hub</span>
        </div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#customers">Customers</a>
        </div>
      </footer>
    </div>
  )
}

export default App
