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
                  <strong>{currency.format(selectedOrder.approvedCost > 0 ? Math.max(0, selectedOrder.verifiedTransfer - selectedOrder.approvedCost) : 0)}</strong>
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
