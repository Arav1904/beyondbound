const ORDER_CONFIRMATION_WEBHOOK_URL = String(
  process.env.ORDER_CONFIRMATION_WEBHOOK_URL || "",
).trim();

const ORDER_CONFIRMATION_WEBHOOK_SECRET = String(
  process.env.ORDER_CONFIRMATION_WEBHOOK_SECRET || "",
).trim();

const ORDER_CONFIRMATION_WEBHOOK_SOURCE =
  String(
    process.env.ORDER_CONFIRMATION_WEBHOOK_SOURCE || "beyond-bound-backend",
  ).trim() || "beyond-bound-backend";

const DEFAULT_TIMEOUT_MS = 5000;
const configuredTimeout = Number.parseInt(
  process.env.ORDER_CONFIRMATION_WEBHOOK_TIMEOUT_MS || "",
  10,
);
const ORDER_CONFIRMATION_WEBHOOK_TIMEOUT_MS =
  Number.isFinite(configuredTimeout) && configuredTimeout >= 1000
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;

const toSafeString = (value) => String(value || "").trim();

const toSafeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toIsoDate = (value) => {
  const parsedDate = value ? new Date(value) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const quantity = Math.max(1, Number.parseInt(item?.quantity, 10) || 1);
    return {
      product_id: toSafeString(item?.productId),
      product_name: toSafeString(item?.productName),
      size: toSafeString(item?.size),
      quantity,
      unit_price: toSafeNumber(item?.price),
      line_total: Number((toSafeNumber(item?.price) * quantity).toFixed(2)),
    };
  });
};

const buildItemsSummary = (items) => {
  const readableItems = items.map((item) => {
    if (!item.product_name) {
      return `${item.quantity} x Item`;
    }

    if (item.size) {
      return `${item.quantity} x ${item.product_name} (${item.size})`;
    }

    return `${item.quantity} x ${item.product_name}`;
  });

  return readableItems.join(", ");
};

const toPayload = (order, context = {}) => {
  const items = normalizeItems(order?.items);
  const customer = order?.customer || {};
  const address = customer.address || {};

  return {
    event_name: "order.placed",
    source: ORDER_CONFIRMATION_WEBHOOK_SOURCE,
    source_endpoint: toSafeString(context.sourceEndpoint),
    flow: toSafeString(context.flow),
    sent_at: new Date().toISOString(),
    order_id: toSafeString(order?._id),
    order_number: toSafeString(order?.orderNumber),
    order_status: toSafeString(order?.status),
    order_date: toIsoDate(order?.placedAt || order?.createdAt),
    currency: toSafeString(order?.currency || "INR"),
    subtotal: toSafeNumber(order?.subtotal),
    shipping_fee: toSafeNumber(order?.shippingFee),
    tax_amount: toSafeNumber(order?.taxAmount),
    discount_amount: toSafeNumber(order?.discountAmount),
    total: toSafeNumber(order?.total),
    customer_name: toSafeString(customer.name),
    customer_email: toSafeString(customer.email).toLowerCase(),
    customer_phone: toSafeString(customer.phone),
    customer_address_line1: toSafeString(address.line1),
    customer_address_line2: toSafeString(address.line2),
    customer_city: toSafeString(address.city),
    customer_state: toSafeString(address.state),
    customer_postal_code: toSafeString(address.postalCode),
    customer_country: toSafeString(address.country),
    notes: toSafeString(order?.notes),
    item_count: items.length,
    items_summary: buildItemsSummary(items),
    items,
  };
};

export const notifyOrderPlacedWebhook = async (order, context = {}) => {
  if (!ORDER_CONFIRMATION_WEBHOOK_URL) {
    return {
      sent: false,
      skipped: true,
      reason: "ORDER_CONFIRMATION_WEBHOOK_URL is not configured",
    };
  }

  const payload = toPayload(order, context);
  if (!payload.customer_email || !payload.order_number) {
    return {
      sent: false,
      skipped: true,
      reason: "customer_email or order_number is missing",
    };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    ORDER_CONFIRMATION_WEBHOOK_TIMEOUT_MS,
  );

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (ORDER_CONFIRMATION_WEBHOOK_SECRET) {
      headers["x-order-webhook-secret"] = ORDER_CONFIRMATION_WEBHOOK_SECRET;
    }

    const response = await fetch(ORDER_CONFIRMATION_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      console.warn(
        `[orders] Confirmation webhook failed with status ${response.status}. ${responseText}`,
      );
      return {
        sent: false,
        skipped: false,
        status: response.status,
      };
    }

    return {
      sent: true,
      skipped: false,
      status: response.status,
    };
  } catch (error) {
    const reason =
      error?.name === "AbortError"
        ? `timeout after ${ORDER_CONFIRMATION_WEBHOOK_TIMEOUT_MS}ms`
        : error?.message || "unknown error";
    console.warn(`[orders] Confirmation webhook was not sent: ${reason}`);
    return {
      sent: false,
      skipped: false,
      reason,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
