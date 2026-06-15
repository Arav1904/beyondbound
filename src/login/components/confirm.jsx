import { useEffect, useMemo, useRef, useState } from "react";
import useMenuStore from "../../useMenuStore";
import { fetchMyOrderById } from "../../services/cartApi";
import { sendOrderConfirmation } from "../../services/emailService";
import "../css/confirm.css";

const formatCurrency = (value) => {
	const amount = Number(value || 0);
	if (!Number.isFinite(amount)) {
		return "INR 0.00";
	}

	return `INR ${amount.toFixed(2)}`;
};

const formatAddress = (address = {}) => {
	const parts = [
		String(address?.line1 || "").trim(),
		String(address?.line2 || "").trim(),
		String(address?.city || "").trim(),
		String(address?.state || "").trim(),
		String(address?.postalCode || "").trim(),
		String(address?.country || "").trim(),
	].filter(Boolean);

	return parts.join(", ") || "Address unavailable";
};

const getQueryParams = () => {
	if (typeof window === "undefined") {
		return {};
	}

	const params = new URLSearchParams(window.location.search);
	return {
		status: String(params.get("status") || "").toLowerCase(),
		orderId: String(params.get("orderId") || "").trim(),
		orderNumber: String(params.get("orderNumber") || "").trim(),
		txnId: String(params.get("txnId") || "").trim(),
	};
};

function Confirm() {
	const authToken = useMenuStore((state) => state.authToken);
	const openProfilePage = useMenuStore((state) => state.openProfilePage);
	const setActivePage = useMenuStore((state) => state.setActivePage);
	const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);

	const [orderDetails, setOrderDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const emailSentRef = useRef(false);

	const params = useMemo(getQueryParams, []);
	const orderLookupId = params.orderId || params.orderNumber;

	useEffect(() => {
		if (!orderLookupId || !authToken) {
			return;
		}

		let active = true;
		setLoading(true);
		setError("");

		fetchMyOrderById(authToken, orderLookupId)
			.then((response) => {
				const data = response?.data || response;
				if (active) {
					setOrderDetails(data || null);

					// Fire confirmation email exactly once per page load
					if (data && !emailSentRef.current) {
						emailSentRef.current = true;
						const customer = data.customer || {};
						const addr = customer.address || {};
						const addrParts = [
							addr.line1,
							addr.line2,
							addr.city,
							addr.state,
							addr.postalCode,
							addr.country,
						].filter(Boolean).join(", ");

						sendOrderConfirmation({
							to_email: customer.email,
							to_name: customer.name,
							order_id: data.orderNumber,
							order_date: data.placedAt
								? new Date(data.placedAt).toLocaleDateString("en-IN")
								: new Date().toLocaleDateString("en-IN"),
							payment_method: String(data.paymentMethod || "payu").toUpperCase(),
							order_status: "Confirmed",
							items: Array.isArray(data.items)
								? data.items.map((item) => ({
										name: item.productName || "Product",
										qty: item.quantity || 1,
										price: item.price || 0,
								  }))
								: [],
							subtotal: `₹${Number(data.subtotal || 0).toFixed(2)}`,
							shipping_fee:
								Number(data.shippingFee || 0) === 0
									? "Free"
									: `₹${Number(data.shippingFee).toFixed(2)}`,
							total_amount: `₹${Number(data.total || 0).toFixed(2)}`,
							shipping_address: addrParts || "Address unavailable",
						}).catch((emailErr) => {
							console.error("Order confirmation email failed:", emailErr);
						});
					}
				}
			})
			.catch((fetchError) => {
				if (active) {
					setError(
						fetchError.message || "We could not load your order details.",
					);
				}
			})
			.finally(() => {
				if (active) {
					setLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authToken, orderLookupId]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const cleanUrl = `${window.location.origin}${window.location.pathname}`;
		window.history.replaceState({}, document.title, cleanUrl);
	}, []);

	const customer = orderDetails?.customer || {};
	const paymentMethod =
		String(orderDetails?.paymentMethod || "payu").toUpperCase();

	const handleViewOrder = () => {
		if (orderLookupId) {
			openProfilePage(orderLookupId);
		} else {
			setActivePage("profile");
		}
	};

	const handleContinueShopping = () => {
		setIsCartOpen(false);
		setActivePage("home");
	};

	return (
		<section className="payment-result-page">
			<div className="payment-result-card">
				<div className="payment-result-header">
					<div>
						<p className="payment-result-badge success">Payment Success</p>
						<h1 className="payment-result-title">Thank you! Your order is confirmed.</h1>
					</div>
					<div>
						<div className="payment-summary-label">Status</div>
						<div className="payment-summary-value">
							{params.status === "success" ? "Paid" : "Processing"}
						</div>
					</div>
				</div>

				<div className="payment-result-summary">
					<div className="payment-summary-card">
						<div className="payment-summary-label">Order Number</div>
						<div className="payment-summary-value">
							{orderDetails?.orderNumber || params.orderNumber || "-"}
						</div>
					</div>
					<div className="payment-summary-card">
						<div className="payment-summary-label">Payment Method</div>
						<div className="payment-summary-value">{paymentMethod}</div>
					</div>
					<div className="payment-summary-card">
						<div className="payment-summary-label">Total</div>
						<div className="payment-summary-value">
							{formatCurrency(orderDetails?.total)}
						</div>
					</div>
					<div className="payment-summary-card">
						<div className="payment-summary-label">Transaction ID</div>
						<div className="payment-summary-value">
							{orderDetails?.paymentTransactionId || params.txnId || "-"}
						</div>
					</div>
				</div>

				<div className="payment-details-grid">
					<div className="payment-detail-section">
						<h3>Delivery Address</h3>
						<p>{formatAddress(customer.address)}</p>
						<p className="payment-detail-muted">{customer.name || ""}</p>
						<p className="payment-detail-muted">{customer.phone || ""}</p>
					</div>
					<div className="payment-detail-section">
						<h3>Order Details</h3>
						<p>Items: {orderDetails?.items?.length ?? "-"}</p>
						<p>Subtotal: {formatCurrency(orderDetails?.subtotal)}</p>
						<p>Shipping: {formatCurrency(orderDetails?.shippingFee)}</p>
						<p>Tax: {formatCurrency(orderDetails?.taxAmount)}</p>
					</div>
					<div className="payment-detail-section">
						<h3>Contact</h3>
						<p>{customer.email || "-"}</p>
						<p className="payment-detail-muted">
							We will send tracking updates to your email.
						</p>
					</div>
				</div>

				{loading ? (
					<p className="payment-detail-muted">Loading order details...</p>
				) : null}

				{error ? <p className="payment-error-note">{error}</p> : null}

				<div className="payment-result-actions">
					<button
						type="button"
						className="payment-primary-btn"
						onClick={handleViewOrder}
					>
						View my order
					</button>
					<button
						type="button"
						className="payment-secondary-btn"
						onClick={handleContinueShopping}
					>
						Continue shopping
					</button>
				</div>
			</div>
		</section>
	);
}

export default Confirm;
