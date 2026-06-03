import { useEffect, useMemo } from "react";
import useMenuStore from "../../useMenuStore";
import "../css/confirm.css";

const getQueryParams = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    status: String(params.get("status") || "").toLowerCase(),
    orderNumber: String(params.get("orderNumber") || "").trim(),
    txnId: String(params.get("txnId") || "").trim(),
    reason: String(params.get("reason") || params.get("error") || "").trim(),
  };
};

function PaymentFailed() {
  const setActivePage = useMenuStore((state) => state.setActivePage);
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);
  const openCheckout = useMenuStore((state) => state.openCheckout);

  const params = useMemo(getQueryParams, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  const handleRetry = () => {
    setActivePage("home");
    setIsCartOpen(true);
    openCheckout();
  };

  const handleContact = () => {
    setActivePage("contact");
  };

  return (
    <section className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-header">
          <div>
            <p className="payment-result-badge failed">Payment Failed</p>
            <h1 className="payment-result-title">We could not complete your payment.</h1>
          </div>
          <div>
            <div className="payment-summary-label">Status</div>
            <div className="payment-summary-value">
              {params.status === "failed" ? "Failed" : "Not completed"}
            </div>
          </div>
        </div>

        <div className="payment-result-summary">
          <div className="payment-summary-card">
            <div className="payment-summary-label">Order Number</div>
            <div className="payment-summary-value">
              {params.orderNumber || "-"}
            </div>
          </div>
          <div className="payment-summary-card">
            <div className="payment-summary-label">Transaction ID</div>
            <div className="payment-summary-value">{params.txnId || "-"}</div>
          </div>
          <div className="payment-summary-card">
            <div className="payment-summary-label">Next Step</div>
            <div className="payment-summary-value">Retry or contact support</div>
          </div>
        </div>

        <div className="payment-details-grid">
          <div className="payment-detail-section">
            <h3>What you can do now</h3>
            <p>Retry with a different payment method.</p>
            <p>Check your bank or wallet balance.</p>
            <p>Contact us if you see a debit without confirmation.</p>
          </div>
          <div className="payment-detail-section">
            <h3>Failure Details</h3>
            <p className="payment-detail-muted">
              {params.reason || "No additional error details were provided."}
            </p>
          </div>
        </div>

        <div className="payment-result-actions">
          <button
            type="button"
            className="payment-primary-btn"
            onClick={handleRetry}
          >
            Retry payment
          </button>
          <button
            type="button"
            className="payment-secondary-btn"
            onClick={handleContact}
          >
            Contact support
          </button>
        </div>
      </div>
    </section>
  );
}

export default PaymentFailed;
