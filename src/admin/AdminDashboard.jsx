import { Fragment, useEffect, useMemo, useState } from "react";
import useMenuStore from "../useMenuStore";
import {
  archiveAdminProduct,
  createAdminProduct,
  fetchAdminAuditLogs,
  deleteAdminTestimonial,
  fetchAdminAnalytics,
  fetchAdminOrders,
  fetchAdminOverview,
  fetchAdminProducts,
  fetchAdminSupportTickets,
  fetchAdminTestimonials,
  fetchAdminUsers,
  updateAdminOrderStatus,
  updateAdminProduct,
  updateAdminSupportTicket,
  updateAdminTestimonial,
  updateAdminUser,
} from "../services/adminApi";
import "./AdminDashboard.css";

const SECTION_LABELS = {
  overview: "Overview",
  audit: "Audit Logs",
  users: "Users",
  orders: "Orders",
  testimonials: "Testimonials",
  products: "Products",
  support: "Support",
  analytics: "Analytics",
};

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

const AUDIT_STATUSES = ["success", "failure"];

const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];
const TICKET_PRIORITIES = ["low", "medium", "high"];

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

const toDateTimeInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatOrderAddress = (address = {}) => {
  const line1 = String(address?.line1 || "").trim();
  const line2 = String(address?.line2 || "").trim();
  const postalCode = String(address?.postalCode || "").trim();
  const country = String(address?.country || "").trim();

  const lineAddress = [line1, line2].filter(Boolean).join(", ");
  const withPostalCode = [lineAddress, postalCode].filter(Boolean).join(" - ");
  const fullAddress = [withPostalCode, country].filter(Boolean).join(", ");

  return fullAddress || "-";
};

const formatOrderCustomerPhone = (order) =>
  String(order?.customer?.phone || "").trim() || "-";

const formatOrderCity = (order) =>
  String(order?.customer?.address?.city || "").trim() || "-";

const formatOrderState = (order) =>
  String(order?.customer?.address?.state || "").trim() || "-";

function AdminDashboard() {
  const authToken = useMenuStore((state) => state.authToken);
  const signedInUser = useMenuStore((state) => state.signedInUser);

  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [expandedOrderRows, setExpandedOrderRows] = useState({});

  const [productDraft, setProductDraft] = useState({
    name: "",
    category: "supplement",
    price: "",
    inventory: "",
    image: "",
    description: "",
    estimatedDispatchDays: 10,
  });

  const [rowDrafts, setRowDrafts] = useState({});

  const sectionOptions = useMemo(
    () => [
      "overview",
      "audit",
      "users",
      "orders",
      "testimonials",
      "products",
      "support",
      "analytics",
    ],
    [],
  );

  const canAccessAdmin = Boolean(authToken && signedInUser?.role === "admin");

  const applyRowDraft = (id, field, value) => {
    setRowDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const showSuccess = (message) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2200);
  };

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!canAccessAdmin) {
      return undefined;
    }

    if (!["orders", "overview"].includes(activeSection)) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRefreshTick((prev) => prev + 1);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [activeSection, canAccessAdmin]);

  useEffect(() => {
    if (!canAccessAdmin) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeSection === "overview") {
          const payload = await fetchAdminOverview(authToken);
          setOverview(payload.data);
          setRecords([]);
          setPagination(null);
          return;
        }

        if (activeSection === "analytics") {
          const payload = await fetchAdminAnalytics(authToken, { range });
          setAnalytics(payload.data);
          setRecords([]);
          setPagination(null);
          return;
        }

        if (activeSection === "audit") {
          const payload = await fetchAdminAuditLogs(authToken, {
            page,
            limit: 20,
            search,
            status: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
          return;
        }

        if (activeSection === "users") {
          const payload = await fetchAdminUsers(authToken, {
            page,
            limit: 12,
            search,
            role: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
          return;
        }

        if (activeSection === "orders") {
          const payload = await fetchAdminOrders(authToken, {
            page,
            limit: 12,
            search,
            status: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
          return;
        }

        if (activeSection === "testimonials") {
          const payload = await fetchAdminTestimonials(authToken, {
            page,
            limit: 12,
            search,
            status: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
          return;
        }

        if (activeSection === "products") {
          const payload = await fetchAdminProducts(authToken, {
            page,
            limit: 12,
            search,
            isActive: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
          return;
        }

        if (activeSection === "support") {
          const payload = await fetchAdminSupportTickets(authToken, {
            page,
            limit: 12,
            search,
            status: statusFilter,
          });
          setRecords(payload.data || []);
          setPagination(payload.pagination || null);
        }
      } catch (loadError) {
        setError(loadError.message || "Could not load admin data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    activeSection,
    authToken,
    canAccessAdmin,
    page,
    range,
    refreshTick,
    search,
    statusFilter,
  ]);

  const goToSection = (section) => {
    setActiveSection(section);
    setPage(1);
    setSearch("");
    setStatusFilter("");
    setError("");
    setRowDrafts({});
    setExpandedOrderRows({});
  };

  const refresh = () => setRefreshTick((prev) => prev + 1);

  const onUpdateUserRole = async (user, role) => {
    setSaving(true);
    try {
      await updateAdminUser(authToken, user._id, { role });
      showSuccess("User role updated");
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update user role");
    } finally {
      setSaving(false);
    }
  };

  const onToggleUserStatus = async (user) => {
    setSaving(true);
    try {
      await updateAdminUser(authToken, user._id, { isActive: !user.isActive });
      showSuccess("User status updated");
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update user status");
    } finally {
      setSaving(false);
    }
  };

  const onSaveOrderStatus = async (order) => {
    const draft = rowDrafts[order._id] || {};
    const status = draft.status || order.status;
    const trackingNumber = draft.trackingNumber ?? order.trackingNumber;
    const payload = {
      status,
      trackingNumber,
    };

    if (Object.prototype.hasOwnProperty.call(draft, "note")) {
      payload.note = String(draft.note || "").trim();
    }

    if (Object.prototype.hasOwnProperty.call(draft, "estimatedDeliveryDate")) {
      const estimatedDeliveryDate = String(
        draft.estimatedDeliveryDate || "",
      ).trim();

      if (!estimatedDeliveryDate) {
        payload.estimatedDeliveryDate = null;
      } else {
        const parsedDate = new Date(estimatedDeliveryDate);
        if (Number.isNaN(parsedDate.getTime())) {
          setError("Please enter a valid estimated delivery date/time");
          return;
        }

        payload.estimatedDeliveryDate = parsedDate.toISOString();
      }
    }

    setSaving(true);
    try {
      await updateAdminOrderStatus(authToken, order._id, payload);
      showSuccess("Order status updated");
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update order");
    } finally {
      setSaving(false);
    }
  };

  const onModerateTestimonial = async (testimonial, status) => {
    setSaving(true);
    try {
      await updateAdminTestimonial(authToken, testimonial._id, {
        status,
        moderationNote:
          status === "approved" ? "Approved by admin" : "Rejected by admin",
      });
      showSuccess(`Testimonial ${status}`);
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update testimonial");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteTestimonial = async (testimonialId) => {
    setSaving(true);
    try {
      await deleteAdminTestimonial(authToken, testimonialId);
      showSuccess("Testimonial deleted");
      refresh();
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete testimonial");
    } finally {
      setSaving(false);
    }
  };

  const onCreateProduct = async (event) => {
    event.preventDefault();

    setSaving(true);
    try {
      await createAdminProduct(authToken, {
        name: productDraft.name,
        category: productDraft.category,
        price: Number(productDraft.price),
        inventory: Number(productDraft.inventory),
        image: productDraft.image,
        description: productDraft.description,
        estimatedDispatchDays: Number(productDraft.estimatedDispatchDays),
      });
      setProductDraft({
        name: "",
        category: "supplement",
        price: "",
        inventory: "",
        image: "",
        description: "",
        estimatedDispatchDays: 10,
      });
      showSuccess("Product created");
      refresh();
    } catch (createError) {
      setError(createError.message || "Could not create product");
    } finally {
      setSaving(false);
    }
  };

  const onSaveProduct = async (product) => {
    const draft = rowDrafts[product._id] || {};
    setSaving(true);
    try {
      await updateAdminProduct(authToken, product._id, {
        price: draft.price ?? product.price,
        inventory: draft.inventory ?? product.inventory,
        estimatedDispatchDays:
          draft.estimatedDispatchDays ?? product.estimatedDispatchDays,
        isActive:
          typeof draft.isActive === "boolean"
            ? draft.isActive
            : product.isActive,
      });
      showSuccess("Product updated");
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update product");
    } finally {
      setSaving(false);
    }
  };

  const onArchiveProduct = async (productId) => {
    setSaving(true);
    try {
      await archiveAdminProduct(authToken, productId);
      showSuccess("Product archived");
      refresh();
    } catch (archiveError) {
      setError(archiveError.message || "Could not archive product");
    } finally {
      setSaving(false);
    }
  };

  const onSaveSupportTicket = async (ticket) => {
    const draft = rowDrafts[ticket._id] || {};

    setSaving(true);
    try {
      await updateAdminSupportTicket(authToken, ticket._id, {
        status: draft.status || ticket.status,
        priority: draft.priority || ticket.priority,
        adminNote: draft.adminNote || "",
      });
      showSuccess("Support ticket updated");
      refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update support ticket");
    } finally {
      setSaving(false);
    }
  };

  const renderOverview = () => {
    const metrics = overview?.metrics;
    if (!metrics) {
      return <p className="admin-empty">No overview data available yet.</p>;
    }

    return (
      <div className="admin-overview">
        <div className="admin-metric-grid">
          {[
            ["Users", metrics.totalUsers],
            ["Active Users", metrics.activeUsers],
            ["Admins", metrics.adminUsers],
            ["Orders", metrics.totalOrders],
            ["Pending Orders", metrics.pendingOrders],
            ["Revenue", formatCurrency(metrics.totalRevenue)],
            ["Pending Testimonials", metrics.pendingTestimonials],
            ["Open Tickets", metrics.openTickets],
            ["Active Products", metrics.activeProducts],
            ["Low Stock", metrics.lowStockProducts],
          ].map(([label, value]) => (
            <article key={label} className="admin-metric-card">
              <p className="admin-metric-label">{label}</p>
              <p className="admin-metric-value">{value}</p>
            </article>
          ))}
        </div>

        <div className="admin-lists-row">
          <section className="admin-mini-list">
            <h3>Recent Users</h3>
            {(overview.recentUsers || []).map((item) => (
              <p key={item._id}>
                {item.name || "Unnamed"} · {item.email} · {item.role}
              </p>
            ))}
          </section>

          <section className="admin-mini-list">
            <h3>Recent Orders</h3>
            {(overview.recentOrders || []).map((item) => (
              <p key={item._id}>
                {item.orderNumber} · {item.status} ·{" "}
                {formatCurrency(item.total)}
              </p>
            ))}
          </section>

          <section className="admin-mini-list">
            <h3>Recent Tickets</h3>
            {(overview.recentTickets || []).map((item) => (
              <p key={item._id}>
                {item.ticketNumber} · {item.status} · {item.subject}
              </p>
            ))}
          </section>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const metrics = analytics?.metrics;

    if (!metrics) {
      return <p className="admin-empty">No analytics data available yet.</p>;
    }

    return (
      <div className="admin-overview">
        <div className="admin-range-row">
          <label htmlFor="admin-range">Range</label>
          <select
            id="admin-range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last 365 days</option>
          </select>
        </div>

        <div className="admin-metric-grid">
          {[
            ["New Users", metrics.newUsers],
            ["Order Count", metrics.orderCount],
            ["Revenue", formatCurrency(metrics.revenue)],
            ["Support Tickets", metrics.ticketCount],
            ["Testimonials", metrics.testimonialCount],
            ["Pending Testimonials", metrics.pendingTestimonials],
          ].map(([label, value]) => (
            <article key={label} className="admin-metric-card">
              <p className="admin-metric-label">{label}</p>
              <p className="admin-metric-value">{value}</p>
            </article>
          ))}
        </div>

        <div className="admin-lists-row">
          <section className="admin-mini-list">
            <h3>Top Products</h3>
            {(analytics.topProducts || []).map((item) => (
              <p key={item.productId || item.productName}>
                {item.productName} · {item.totalQuantity} sold ·{" "}
                {formatCurrency(item.totalRevenue)}
              </p>
            ))}
          </section>

          <section className="admin-mini-list">
            <h3>Orders by Status</h3>
            {(analytics.ordersByStatus || []).map((item) => (
              <p key={item._id}>
                {item._id} · {item.count}
              </p>
            ))}
          </section>
        </div>
      </div>
    );
  };

  const renderTableHeader = () => {
    if (["overview", "analytics"].includes(activeSection)) {
      return null;
    }

    return (
      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder={`Search ${SECTION_LABELS[activeSection]}`}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        {activeSection === "users" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        ) : null}

        {activeSection === "orders" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : null}

        {activeSection === "testimonials" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        ) : null}

        {activeSection === "products" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All products</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        ) : null}

        {activeSection === "support" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : null}

        {activeSection === "audit" ? (
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All log statuses</option>
            {AUDIT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    );
  };

  const renderAuditLogs = () => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Status</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {records.map((log) => (
            <tr key={log._id}>
              <td>{formatDate(log.createdAt)}</td>
              <td>{log.actorEmail || log.actorId?.email || "system"}</td>
              <td>{log.action}</td>
              <td>
                {log.entityType || "-"}
                {log.entityId ? (
                  <>
                    <br />
                    <span className="admin-muted">{log.entityId}</span>
                  </>
                ) : null}
              </td>
              <td>{log.status}</td>
              <td>{log.ip || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((user) => (
            <tr key={user._id}>
              <td>{user.name || "-"}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? "active" : "suspended"}</td>
              <td>{formatDate(user.lastLoginAt)}</td>
              <td>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUserRole(
                        user,
                        user.role === "admin" ? "user" : "admin",
                      )
                    }
                    disabled={saving}
                  >
                    {user.role === "admin" ? "Demote" : "Promote"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleUserStatus(user)}
                    disabled={saving}
                  >
                    {user.isActive ? "Suspend" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Tracking</th>
            <th>ETA</th>
            <th>Placed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((order) => {
            const draft = rowDrafts[order._id] || {};
            const isExpanded = Boolean(expandedOrderRows[order._id]);
            const detailsPanelId = `admin-order-details-${order._id}`;
            const phoneNumber = formatOrderCustomerPhone(order);
            const address = formatOrderAddress(order?.customer?.address);
            const city = formatOrderCity(order);
            const state = formatOrderState(order);

            return (
              <Fragment key={order._id}>
                <tr>
                  <td>{order.orderNumber}</td>
                  <td>
                    {order.customer?.name || "-"}
                    <br />
                    <span className="admin-muted">
                      {order.customer?.email || "-"}
                    </span>
                  </td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <select
                      value={draft.status || order.status}
                      onChange={(event) =>
                        applyRowDraft(order._id, "status", event.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={draft.trackingNumber ?? order.trackingNumber ?? ""}
                      onChange={(event) =>
                        applyRowDraft(
                          order._id,
                          "trackingNumber",
                          event.target.value,
                        )
                      }
                      placeholder="Tracking"
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={
                        draft.estimatedDeliveryDate ??
                        toDateTimeInputValue(order.estimatedDeliveryDate)
                      }
                      onChange={(event) =>
                        applyRowDraft(
                          order._id,
                          "estimatedDeliveryDate",
                          event.target.value,
                        )
                      }
                      placeholder="ETA"
                    />
                  </td>
                  <td>{formatDate(order.placedAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => onSaveOrderStatus(order)}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className={`admin-order-detail-toggle${isExpanded ? " is-open" : ""}`}
                        onClick={() => toggleOrderDetails(order._id)}
                        aria-expanded={isExpanded}
                        aria-controls={detailsPanelId}
                      >
                        {isExpanded ? "Hide details" : "View details"}
                      </button>
                    </div>
                  </td>
                </tr>

                {isExpanded ? (
                  <tr className="admin-order-detail-row">
                    <td colSpan={8}>
                      <div
                        id={detailsPanelId}
                        className="admin-order-detail-panel"
                      >
                        <article className="admin-order-detail-item">
                          <p className="admin-order-detail-label">
                            Phone Number
                          </p>
                          <p className="admin-order-detail-value">
                            {phoneNumber}
                          </p>
                        </article>
                        <article className="admin-order-detail-item">
                          <p className="admin-order-detail-label">Address</p>
                          <p className="admin-order-detail-value">{address}</p>
                        </article>
                        <article className="admin-order-detail-item">
                          <p className="admin-order-detail-label">City</p>
                          <p className="admin-order-detail-value">{city}</p>
                        </article>
                        <article className="admin-order-detail-item">
                          <p className="admin-order-detail-label">State</p>
                          <p className="admin-order-detail-value">{state}</p>
                        </article>
                        <article className="admin-order-detail-item admin-order-detail-item--wide">
                          <p className="admin-order-detail-label">
                            Update Note
                          </p>
                          <input
                            type="text"
                            value={draft.note ?? order.notes ?? ""}
                            onChange={(event) =>
                              applyRowDraft(
                                order._id,
                                "note",
                                event.target.value,
                              )
                            }
                            placeholder="Optional note for this status update"
                          />
                        </article>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderTestimonials = () => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quote</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.quote}</td>
              <td>{item.status}</td>
              <td>{item.rating}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() => onModerateTestimonial(item, "approved")}
                    disabled={saving}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onModerateTestimonial(item, "rejected")}
                    disabled={saving}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="admin-danger"
                    onClick={() => onDeleteTestimonial(item._id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProducts = () => (
    <>
      <form className="admin-product-form" onSubmit={onCreateProduct}>
        <h3>Add Product</h3>
        <div className="admin-product-grid">
          <input
            type="text"
            value={productDraft.name}
            placeholder="Product name"
            onChange={(event) =>
              setProductDraft((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
          <input
            type="text"
            value={productDraft.category}
            placeholder="Category"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={productDraft.price}
            placeholder="Price"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                price: event.target.value,
              }))
            }
            required
          />
          <input
            type="number"
            min="0"
            value={productDraft.inventory}
            placeholder="Inventory"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                inventory: event.target.value,
              }))
            }
            required
          />
          <input
            type="url"
            value={productDraft.image}
            placeholder="Image URL"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                image: event.target.value,
              }))
            }
          />
          <input
            type="text"
            value={productDraft.description}
            placeholder="Description"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
          <input
            type="number"
            min="0"
            value={productDraft.estimatedDispatchDays}
            placeholder="Dispatch days"
            onChange={(event) =>
              setProductDraft((prev) => ({
                ...prev,
                estimatedDispatchDays: event.target.value,
              }))
            }
          />
        </div>
        <button type="submit" disabled={saving}>
          Create Product
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Dispatch Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((product) => {
              const draft = rowDrafts[product._id] || {};
              return (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.price ?? product.price}
                      onChange={(event) =>
                        applyRowDraft(product._id, "price", event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={draft.inventory ?? product.inventory}
                      onChange={(event) =>
                        applyRowDraft(
                          product._id,
                          "inventory",
                          event.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={
                        draft.estimatedDispatchDays ??
                        product.estimatedDispatchDays ??
                        0
                      }
                      onChange={(event) =>
                        applyRowDraft(
                          product._id,
                          "estimatedDispatchDays",
                          event.target.value,
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={
                        typeof draft.isActive === "boolean"
                          ? String(draft.isActive)
                          : String(product.isActive)
                      }
                      onChange={(event) =>
                        applyRowDraft(
                          product._id,
                          "isActive",
                          event.target.value === "true",
                        )
                      }
                    >
                      <option value="true">active</option>
                      <option value="false">inactive</option>
                    </select>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => onSaveProduct(product)}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() => onArchiveProduct(product._id)}
                        disabled={saving}
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderSupport = () => (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Customer</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Admin Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((ticket) => {
            const draft = rowDrafts[ticket._id] || {};
            return (
              <tr key={ticket._id}>
                <td>{ticket.ticketNumber}</td>
                <td>
                  {ticket.name}
                  <br />
                  <span className="admin-muted">{ticket.email}</span>
                </td>
                <td>{ticket.subject}</td>
                <td>
                  <select
                    value={draft.status || ticket.status}
                    onChange={(event) =>
                      applyRowDraft(ticket._id, "status", event.target.value)
                    }
                  >
                    {TICKET_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={draft.priority || ticket.priority}
                    onChange={(event) =>
                      applyRowDraft(ticket._id, "priority", event.target.value)
                    }
                  >
                    {TICKET_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Add note"
                    value={draft.adminNote || ""}
                    onChange={(event) =>
                      applyRowDraft(ticket._id, "adminNote", event.target.value)
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onSaveSupportTicket(ticket)}
                    disabled={saving}
                  >
                    Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderActiveSection = () => {
    if (loading) {
      return (
        <p className="admin-empty">
          Loading {SECTION_LABELS[activeSection]}...
        </p>
      );
    }

    if (activeSection === "overview") {
      return renderOverview();
    }

    if (activeSection === "analytics") {
      return renderAnalytics();
    }

    if (records.length === 0) {
      return <p className="admin-empty">No records found.</p>;
    }

    if (activeSection === "users") {
      return renderUsers();
    }

    if (activeSection === "audit") {
      return renderAuditLogs();
    }

    if (activeSection === "orders") {
      return renderOrders();
    }

    if (activeSection === "testimonials") {
      return renderTestimonials();
    }

    if (activeSection === "products") {
      return renderProducts();
    }

    if (activeSection === "support") {
      return renderSupport();
    }

    return null;
  };

  if (!signedInUser) {
    return (
      <main className="admin-page-shell">
        <section className="admin-lock-card">
          <h2>Admin Dashboard</h2>
          <p>Please sign in with an admin account to continue.</p>
        </section>
      </main>
    );
  }

  if (!canAccessAdmin) {
    return (
      <main className="admin-page-shell">
        <section className="admin-lock-card">
          <h2>Admin Dashboard</h2>
          <p>This account does not have admin access.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page-shell">
      <section className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Control Center</p>
          <h1>Beyond Bound Admin</h1>
          <p className="admin-subline">
            Manage users, orders, testimonials, products, support, audit logs,
            and analytics in one place.
          </p>
        </div>
      </section>

      <section
        className="admin-tabs-row"
        role="tablist"
        aria-label="Admin sections"
      >
        {sectionOptions.map((section) => (
          <button
            key={section}
            type="button"
            className={`admin-tab-btn${activeSection === section ? " active" : ""}`}
            onClick={() => goToSection(section)}
          >
            {SECTION_LABELS[section]}
          </button>
        ))}
      </section>

      {renderTableHeader()}

      {error ? <p className="admin-alert admin-alert-error">{error}</p> : null}
      {success ? (
        <p className="admin-alert admin-alert-success">{success}</p>
      ) : null}

      <section className="admin-content-card">{renderActiveSection()}</section>

      {pagination ? (
        <section className="admin-pagination">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <p>
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </section>
      ) : null}
    </main>
  );
}

export default AdminDashboard;
