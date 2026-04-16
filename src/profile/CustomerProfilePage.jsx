import { useCallback, useEffect, useMemo, useState } from "react";
import useMenuStore from "../useMenuStore";
import { fetchMyOrderById, fetchMyOrders } from "../services/cartApi";
import "./CustomerProfilePage.css";

const TIMELINE_STAGES = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Order Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_TO_STAGE = {
  placed: "placed",
  preorder_requested: "placed",
  confirmed: "confirmed",
  preorder_confirmed: "confirmed",
  packed: "packed",
  processing: "packed",
  shipped: "shipped",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
};

const normalizeOrdersResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return "INR 0.00";
  }

  return `INR ${amount.toFixed(2)}`;
};

const formatDate = (value, options) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(undefined, options);
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

  return parts.join(", ") || "Address not added yet";
};

const resolveActiveStageIndex = (order = {}) => {
  const currentStageKey = STATUS_TO_STAGE[String(order.status || "").trim()];
  const stageKeys = TIMELINE_STAGES.map((stage) => stage.key);

  if (currentStageKey) {
    const stageIndex = stageKeys.indexOf(currentStageKey);
    if (stageIndex >= 0) {
      return stageIndex;
    }
  }

  const history = Array.isArray(order.statusHistory)
    ? [...order.statusHistory].reverse()
    : [];

  for (const entry of history) {
    const stageKey = STATUS_TO_STAGE[String(entry?.status || "").trim()];
    if (!stageKey) {
      continue;
    }

    const stageIndex = stageKeys.indexOf(stageKey);
    if (stageIndex >= 0) {
      return stageIndex;
    }
  }

  return 0;
};

const buildStageTimestamps = (order = {}) => {
  const stageTimestamps = {};
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  for (const entry of history) {
    const stageKey = STATUS_TO_STAGE[String(entry?.status || "").trim()];
    if (!stageKey || !entry?.at || stageTimestamps[stageKey]) {
      continue;
    }

    stageTimestamps[stageKey] = entry.at;
  }

  if (!stageTimestamps.placed && order.placedAt) {
    stageTimestamps.placed = order.placedAt;
  }

  return stageTimestamps;
};

const buildTimeline = (order = {}) => {
  const activeIndex = resolveActiveStageIndex(order);
  const stageTimestamps = buildStageTimestamps(order);

  return TIMELINE_STAGES.map((stage, index) => {
    const isDelivered = String(order.status || "").trim() === "delivered";
    const isCompleted = isDelivered ? index <= activeIndex : index < activeIndex;

    return {
      ...stage,
      timestamp: stageTimestamps[stage.key] || null,
      isCompleted,
      isActive: index === activeIndex,
    };
  });
};

function CustomerProfilePage() {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const authToken = useMenuStore((state) => state.authToken);
  const accountProfile = useMenuStore((state) => state.accountProfile);
  const setIsLoginModalOpen = useMenuStore((state) => state.setIsLoginModalOpen);
  const setAuthMode = useMenuStore((state) => state.setAuthMode);
  const selectedProfileOrderId = useMenuStore(
    (state) => state.selectedProfileOrderId,
  );
  const setSelectedProfileOrderId = useMenuStore(
    (state) => state.setSelectedProfileOrderId,
  );

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const profileData = useMemo(
    () => ({
      name: accountProfile?.name || signedInUser?.name || "Customer",
      email: accountProfile?.email || signedInUser?.email || "",
      phone: accountProfile?.phone || signedInUser?.phone || "",
      picture: signedInUser?.picture || "",
      address: accountProfile?.address || signedInUser?.address || {},
    }),
    [accountProfile, signedInUser],
  );

  const syncOrders = useCallback(
    async ({ showLoader = false, showRefreshing = false } = {}) => {
      if (!authToken) {
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      if (showRefreshing) {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await fetchMyOrders(authToken, { page: 1, limit: 50 });
        const nextOrders = normalizeOrdersResponse(response);
        setOrders(nextOrders);

        let nextSelectedId = selectedOrderId || selectedProfileOrderId || "";
        let selectedFromList = nextOrders.find(
          (order) =>
            order.id === nextSelectedId || order.orderNumber === nextSelectedId,
        );

        if (!selectedFromList && nextOrders.length > 0) {
          selectedFromList = nextOrders[0];
          nextSelectedId = selectedFromList.id || selectedFromList.orderNumber;
        }

        if (!selectedFromList) {
          nextSelectedId = "";
        }

        setSelectedOrderId(nextSelectedId);
        setSelectedProfileOrderId(nextSelectedId);
        setSelectedOrder(selectedFromList || null);
      } catch (loadError) {
        setError(loadError.message || "Could not load your order history");
      } finally {
        if (showLoader) {
          setLoading(false);
        }

        if (showRefreshing) {
          setRefreshing(false);
        }
      }
    },
    [
      authToken,
      selectedOrderId,
      selectedProfileOrderId,
      setSelectedProfileOrderId,
    ],
  );

  useEffect(() => {
    if (!authToken) {
      return;
    }

    syncOrders({ showLoader: true });
  }, [authToken, syncOrders]);

  useEffect(() => {
    if (!authToken) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      syncOrders({ showRefreshing: true });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [authToken, syncOrders]);

  useEffect(() => {
    if (!selectedProfileOrderId) {
      return;
    }

    setSelectedOrderId(selectedProfileOrderId);
  }, [selectedProfileOrderId]);

  useEffect(() => {
    if (!authToken || !selectedOrderId) {
      return;
    }

    let cancelled = false;

    const loadOrderDetail = async () => {
      setDetailLoading(true);

      try {
        const detail = await fetchMyOrderById(authToken, selectedOrderId);
        if (!cancelled) {
          setSelectedOrder(detail);
        }
      } catch {
        if (!cancelled) {
          const fallback = orders.find(
            (order) =>
              order.id === selectedOrderId || order.orderNumber === selectedOrderId,
          );
          setSelectedOrder(fallback || null);
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    loadOrderDetail();

    return () => {
      cancelled = true;
    };
  }, [authToken, orders, selectedOrderId]);

  const selectOrder = (order) => {
    const nextOrderId = order.id || order.orderNumber;
    if (!nextOrderId) {
      return;
    }

    setSelectedOrderId(nextOrderId);
    setSelectedProfileOrderId(nextOrderId);
    setSelectedOrder(order);
  };

  if (!signedInUser || !authToken) {
    return (
      <section className="customer-profile-page">
        <div className="customer-profile-empty">
          <h1>Profile and Order Tracking</h1>
          <p>Sign in to view your profile, order history, and live tracking timeline.</p>
          <button
            type="button"
            className="customer-primary-btn"
            onClick={() => {
              setAuthMode("signup");
              setIsLoginModalOpen(true);
            }}
          >
            Sign In to Continue
          </button>
        </div>
      </section>
    );
  }

  const selectedTimeline = buildTimeline(selectedOrder || {});
  const selectedItems = Array.isArray(selectedOrder?.items) ? selectedOrder.items : [];

  return (
    <section className="customer-profile-page">
      <header className="customer-profile-header">
        <p className="customer-profile-eyebrow">Customer Dashboard</p>
        <h1>Profile and Order Tracking</h1>
        <p>
          Review account details, monitor every order stage, and refresh live status
          updates anytime.
        </p>
      </header>

      <div className="customer-profile-grid">
        <article className="customer-card customer-profile-card">
          <div className="customer-profile-top">
            {profileData.picture ? (
              <img
                src={profileData.picture}
                alt={profileData.name}
                className="customer-profile-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="customer-profile-avatar customer-profile-avatar--fallback">
                {(profileData.name || "C").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2>{profileData.name}</h2>
              <p>{profileData.email || "-"}</p>
            </div>
          </div>

          <div className="customer-profile-meta">
            <div>
              <span>Phone</span>
              <p>{profileData.phone || "Not added yet"}</p>
            </div>
            <div>
              <span>Address</span>
              <p>{formatAddress(profileData.address)}</p>
            </div>
          </div>
        </article>

        <article className="customer-card customer-history-card">
          <div className="customer-history-head">
            <h2>Order History</h2>
            <button
              type="button"
              className="customer-secondary-btn"
              onClick={() => syncOrders({ showRefreshing: true })}
              disabled={refreshing || loading}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <p className="customer-help-text">Loading your order history...</p>
          ) : orders.length === 0 ? (
            <p className="customer-help-text">No orders found for this account yet.</p>
          ) : (
            <div className="customer-order-list">
              {orders.map((order) => {
                const isSelected =
                  selectedOrderId === order.id ||
                  selectedOrderId === order.orderNumber;

                return (
                  <button
                    key={order.id || order.orderNumber}
                    type="button"
                    className={`customer-order-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => selectOrder(order)}
                  >
                    <div className="customer-order-item-top">
                      <p>{order.orderNumber}</p>
                      <span>{String(order.status || "placed").replaceAll("_", " ")}</span>
                    </div>
                    <p>
                      {formatDate(order.placedAt, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p>
                      {(Array.isArray(order.items) ? order.items.length : 0)} item(s) - {formatCurrency(order.total)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </article>
      </div>

      <article className="customer-card customer-tracking-card">
        <div className="customer-tracking-head">
          <h2>Order Details and Tracking</h2>
          {detailLoading ? <span>Syncing detail...</span> : null}
        </div>

        {error ? <p className="customer-error-text">{error}</p> : null}

        {!selectedOrder ? (
          <p className="customer-help-text">Select an order to view full tracking details.</p>
        ) : (
          <>
            <div className="customer-order-summary-grid">
              <div>
                <span>Order ID</span>
                <p>{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <span>Order Date</span>
                <p>{formatDate(selectedOrder.placedAt)}</p>
              </div>
              <div>
                <span>Current Status</span>
                <p className="customer-status-pill">
                  {String(selectedOrder.status || "placed").replaceAll("_", " ")}
                </p>
              </div>
              <div>
                <span>Estimated Delivery</span>
                <p>
                  {selectedOrder.estimatedDeliveryDate
                    ? formatDate(selectedOrder.estimatedDeliveryDate)
                    : "Not available yet"}
                </p>
              </div>
              <div>
                <span>Tracking Number</span>
                <p>{selectedOrder.trackingNumber || "Not assigned"}</p>
              </div>
              <div>
                <span>Total</span>
                <p>{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="customer-timeline" aria-label="Order timeline">
              {selectedTimeline.map((stage, index) => (
                <div
                  key={stage.key}
                  className={`customer-timeline-item${stage.isCompleted ? " is-complete" : ""}${stage.isActive ? " is-active" : ""}`}
                >
                  <div className="customer-timeline-dot">
                    {stage.isCompleted || stage.isActive ? "OK" : String(index + 1)}
                  </div>
                  {index < selectedTimeline.length - 1 ? (
                    <div className="customer-timeline-line" />
                  ) : null}
                  <div className="customer-timeline-content">
                    <p>{stage.label}</p>
                    <span>
                      {stage.timestamp
                        ? formatDate(stage.timestamp)
                        : "Waiting for update"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="customer-items-list">
              <h3>Items in this order</h3>
              {selectedItems.length === 0 ? (
                <p className="customer-help-text">No items found for this order.</p>
              ) : (
                selectedItems.map((item, index) => (
                  <div
                    className="customer-item-row"
                    key={`${item.productId || item.productName || "item"}-${index}`}
                  >
                    <p>{item.productName || "Product"}</p>
                    <span>
                      Qty {Number(item.quantity || 0)} - {formatCurrency(item.price)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </article>
    </section>
  );
}

export default CustomerProfilePage;
