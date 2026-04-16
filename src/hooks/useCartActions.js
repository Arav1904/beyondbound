import useMenuStore from "../useMenuStore";
import { addCartItem } from "../services/cartApi";
import {
  fetchPrimaryProduct,
  fetchPublicProduct,
} from "../services/productApi";
import {
  getPrimaryImage,
  normalizePackSizes,
  normalizePrimaryProduct,
} from "../services/productCatalog";

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const getSizeTokens = (value) => {
  const raw = String(value || "").trim();
  const numericMatch = raw.match(/\d+/);

  return {
    raw,
    numeric: numericMatch ? String(numericMatch[0]) : "",
  };
};

const toOrderItemLabel = (item = {}) =>
  String(item.productName || item.name || item.productId || "this item").trim();

const buildCartProductId = (productKey, sizeValue) => {
  const normalizedKey = String(productKey || "").trim() || "glycomics";
  const normalizedSize = String(sizeValue || "").trim();

  if (!normalizedSize) {
    return normalizedKey;
  }

  if (
    normalizedKey.toLowerCase().endsWith(`-${normalizedSize.toLowerCase()}`)
  ) {
    return normalizedKey;
  }

  return `${normalizedKey}-${normalizedSize}`;
};

const buildProductIdentifierCandidates = (item = {}) => {
  const candidates = [];
  const add = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized || candidates.includes(normalized)) {
      return;
    }

    candidates.push(normalized);
  };

  const productId = String(
    item.productId || item.productIdentifier || "",
  ).trim();
  const productSlug = String(item.productSlug || "").trim();
  const productName = String(item.productName || item.name || "").trim();
  const sizeTokens = getSizeTokens(item.size);

  add(productId);
  add(productSlug);

  if (productId && sizeTokens.raw) {
    const suffix = `-${sizeTokens.raw}`;
    if (productId.toLowerCase().endsWith(suffix.toLowerCase())) {
      add(productId.slice(0, -suffix.length));
    }
  }

  if (productId && sizeTokens.numeric) {
    const suffix = `-${sizeTokens.numeric}`;
    if (productId.toLowerCase().endsWith(suffix.toLowerCase())) {
      add(productId.slice(0, -suffix.length));
    }
  }

  if (productId) {
    const noTrailingSize = productId.replace(/-\d+$/u, "");
    if (noTrailingSize !== productId) {
      add(noTrailingSize);
    }
  }

  if (productName) {
    const baseName = productName.replace(/\([^)]*\)/gu, " ").trim();
    const slugFromName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "");

    add(slugFromName);
  }

  return candidates;
};

const shouldUsePrimaryFallback = (item = {}) => {
  const searchable =
    `${String(item.productId || "")} ${String(item.productName || "")}`
      .toLowerCase()
      .trim();

  return searchable.includes("glycomics");
};

const pickPackSize = (packSizes = [], item = {}) => {
  const sizeTokens = getSizeTokens(item.size);

  if (!Array.isArray(packSizes) || packSizes.length === 0) {
    return null;
  }

  return (
    packSizes.find(
      (pack) => String(pack.value || "").trim() === sizeTokens.raw,
    ) ||
    packSizes.find(
      (pack) => String(pack.value || "").trim() === sizeTokens.numeric,
    ) ||
    null
  );
};

function useCartActions() {
  const signedInUser = useMenuStore((state) => state.signedInUser);
  const authToken = useMenuStore((state) => state.authToken);
  const addToCartLocal = useMenuStore((state) => state.addToCartLocal);
  const setCartFromServer = useMenuStore((state) => state.setCartFromServer);
  const setCartSyncing = useMenuStore((state) => state.setCartSyncing);
  const setCartMessage = useMenuStore((state) => state.setCartMessage);
  const setIsCartOpen = useMenuStore((state) => state.setIsCartOpen);

  const addNormalizedCartItem = async (
    normalized,
    { allowLocalFallback = true } = {},
  ) => {
    if (!normalized.productId || !normalized.productName) {
      return {
        ok: false,
        message: "Could not add item: missing product details.",
      };
    }

    if (signedInUser && authToken) {
      try {
        const cart = await addCartItem(authToken, normalized);
        setCartFromServer(cart);
        return {
          ok: true,
          usedLocalFallback: false,
          usedServer: true,
        };
      } catch (error) {
        if (!allowLocalFallback) {
          return {
            ok: false,
            message: error.message || "Failed to add item to cart.",
          };
        }

        addToCartLocal(normalized);
        return {
          ok: true,
          usedLocalFallback: true,
          usedServer: false,
          message:
            error.message ||
            `${normalized.productName} added locally. Will sync after reconnection.`,
        };
      }
    }

    addToCartLocal(normalized);

    return {
      ok: true,
      usedLocalFallback: true,
      usedServer: false,
    };
  };

  const resolveReorderCartItem = async (orderItem, context) => {
    const quantity = toPositiveInt(orderItem?.quantity, 0);
    if (quantity < 1) {
      return {
        ok: false,
        reason: `Skipped ${toOrderItemLabel(orderItem)}: invalid quantity.`,
      };
    }

    const identifierCandidates = buildProductIdentifierCandidates(orderItem);
    let product = null;

    for (const identifier of identifierCandidates) {
      if (context.productCache.has(identifier)) {
        product = context.productCache.get(identifier);
      } else {
        try {
          const fetched = await fetchPublicProduct(identifier);
          product = normalizePrimaryProduct(fetched);
          context.productCache.set(identifier, product);

          if (product.id) {
            context.productCache.set(String(product.id), product);
          }

          if (product.slug) {
            context.productCache.set(String(product.slug), product);
          }
        } catch {
          context.productCache.set(identifier, null);
          product = null;
        }
      }

      if (product) {
        break;
      }
    }

    if (!product && shouldUsePrimaryFallback(orderItem)) {
      if (!context.primaryProductPromise) {
        context.primaryProductPromise = fetchPrimaryProduct()
          .then((response) => normalizePrimaryProduct(response))
          .catch(() => null);
      }

      product = await context.primaryProductPromise;
    }

    if (!product) {
      return {
        ok: false,
        reason: `Skipped ${toOrderItemLabel(orderItem)}: product not found in current catalog.`,
      };
    }

    const normalizedProduct = normalizePrimaryProduct(product);
    const packSizes = normalizePackSizes(normalizedProduct);
    const matchedPack = pickPackSize(packSizes, orderItem);
    const sizeTokens = getSizeTokens(orderItem?.size);
    const resolvedSize = String(
      matchedPack?.value || sizeTokens.numeric || sizeTokens.raw || "",
    ).trim();
    const productKey =
      String(
        normalizedProduct.slug ||
          normalizedProduct.id ||
          identifierCandidates[0] ||
          orderItem?.productId ||
          "glycomics",
      ).trim() || "glycomics";

    return {
      ok: true,
      item: {
        productId: buildCartProductId(productKey, resolvedSize),
        productName: matchedPack?.label
          ? `${normalizedProduct.name} (${matchedPack.label})`
          : String(normalizedProduct.name || toOrderItemLabel(orderItem)),
        price: toNonNegativeNumber(matchedPack?.price, normalizedProduct.price),
        image: getPrimaryImage(normalizedProduct, orderItem?.image),
        quantity,
        size: resolvedSize,
      },
    };
  };

  const addProductToCart = async (item) => {
    const normalized = {
      productId: String(item?.productId || item?.id || "").trim(),
      productName: String(item?.productName || item?.name || "").trim(),
      price: toNonNegativeNumber(item?.price, 0),
      image: String(item?.image || item?.imageUrl || "").trim(),
      quantity: toPositiveInt(item?.quantity, 1),
      size: String(item?.size || "").trim(),
    };

    if (signedInUser && authToken) {
      setCartSyncing(true);
    }

    try {
      const result = await addNormalizedCartItem(normalized, {
        allowLocalFallback: true,
      });

      if (!result.ok) {
        setCartMessage(result.message || "Could not add item to cart.");
        return;
      }

      if (signedInUser && authToken) {
        if (result.usedLocalFallback) {
          setCartMessage(
            result.message ||
              `${normalized.productName} added locally. Will sync after reconnection.`,
          );
        } else {
          setCartMessage(
            `${normalized.productName} added to your account cart.`,
          );
        }

        return;
      }

      setCartMessage(`${normalized.productName} added to cart.`);
      return;
    } finally {
      if (signedInUser && authToken) {
        setCartSyncing(false);
      }
    }
  };

  const reorderOrderToCart = async (order, { openCart = true } = {}) => {
    const items = Array.isArray(order?.items) ? order.items : [];

    const summary = {
      totalItems: items.length,
      addedCount: 0,
      failedCount: 0,
      localFallbackCount: 0,
      failedItems: [],
      message: "",
    };

    if (items.length === 0) {
      summary.message = "No items found in this order to reorder.";
      setCartMessage(summary.message);
      return summary;
    }

    const context = {
      productCache: new Map(),
      primaryProductPromise: null,
    };

    if (signedInUser && authToken) {
      setCartSyncing(true);
    }

    try {
      for (const orderItem of items) {
        const resolved = await resolveReorderCartItem(orderItem, context);
        if (!resolved.ok) {
          summary.failedCount += 1;
          summary.failedItems.push({
            label: toOrderItemLabel(orderItem),
            reason: resolved.reason || "Unavailable item",
          });
          continue;
        }

        const result = await addNormalizedCartItem(resolved.item, {
          allowLocalFallback: true,
        });

        if (!result.ok) {
          summary.failedCount += 1;
          summary.failedItems.push({
            label: resolved.item.productName,
            reason: result.message || "Failed to add item",
          });
          continue;
        }

        summary.addedCount += 1;

        if (result.usedLocalFallback && signedInUser && authToken) {
          summary.localFallbackCount += 1;
        }
      }
    } finally {
      if (signedInUser && authToken) {
        setCartSyncing(false);
      }
    }

    const orderLabel = String(order?.orderNumber || "that order").trim();

    if (summary.addedCount === 0) {
      summary.message =
        summary.failedCount > 0
          ? `Could not reorder items from ${orderLabel}.`
          : `No reorderable items were found in ${orderLabel}.`;
    } else if (summary.failedCount === 0) {
      summary.message = `Added ${summary.addedCount} item${
        summary.addedCount === 1 ? "" : "s"
      } from ${orderLabel} to cart.`;
    } else {
      summary.message = `Added ${summary.addedCount} item${
        summary.addedCount === 1 ? "" : "s"
      } from ${orderLabel}. ${summary.failedCount} item${
        summary.failedCount === 1 ? "" : "s"
      } could not be added.`;
    }

    if (summary.localFallbackCount > 0) {
      summary.message = `${summary.message} Some items were saved locally and will sync when connection is restored.`;
    }

    setCartMessage(summary.message);

    if (openCart && summary.addedCount > 0) {
      setIsCartOpen(true);
    }

    return summary;
  };

  return { addProductToCart, reorderOrderToCart };
}

export default useCartActions;
