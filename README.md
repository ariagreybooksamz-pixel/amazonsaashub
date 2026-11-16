# MPS Sourcing Hub by Area71

Private management walkthrough for operations, sourcing, and supplier review without public trial or self-signup prompts.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Replace the placeholder values with your invite-only walkthrough credentials.
3. Run the setup script:

```bash
npm install
npm run setup:walkthrough
npm run dev -- --host 0.0.0.0
```

## Production build

```bash
npm install
npm run build
```

## Vercel Preview deployment

1. Push the repo to GitHub.
2. In Vercel, import the repository.
3. Set the project framework to Vite.
4. Add the same environment variables used in `.env.local`:
   - `VITE_WALKTHROUGH_OPERATIONS_EMAIL`
   - `VITE_WALKTHROUGH_OPERATIONS_PASSWORD`
   - `VITE_WALKTHROUGH_SOURCING_EMAIL`
   - `VITE_WALKTHROUGH_SOURCING_PASSWORD`
   - `VITE_WALKTHROUGH_SUPPLIER_EMAIL`
   - `VITE_WALKTHROUGH_SUPPLIER_PASSWORD`
   - `WALKTHROUGH_ENV=staging`
5. Deploy a Preview environment and share the invite-only sign-in page with management.

## Access model

- Operations Team: full walkthrough order review, approval, and discrepancy handling
- Sourcing Team: assigned order triage, purchase request creation, and payment reporting
- Supplier: assigned purchase records, price confirmation, shipment detail updates, and receipt submission

The public landing page intentionally contains no trial, demo, or self-signup link.
