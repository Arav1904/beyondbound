import Cart from "../models/Cart.js";

const CART_KEY_SEPARATOR = "::";

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

const normalizeItem = (item) => {
  if (!item) {
    return null;
  }

  const productId = String(item.productId || item.id || "").trim();
  const productName = String(item.productName || item.name || "").trim();

  if (!productId || !productName) {
    return null;
  }

  return {
    productId,
    productName,
    price: toNonNegativeNumber(item.price, 0),
    image: String(item.image || item.imageUrl || "").trim(),
    size: String(item.size || "").trim(),
    quantity: toPositiveInt(item.quantity, 1),
  };
};

const itemKey = (item) => `${item.productId}${CART_KEY_SEPARATOR}${item.size || "default"}`;

export const mergeCartItems = (existingItems = [], incomingItems = []) => {
  const map = new Map();

  for (const rawItem of existingItems) {
    const normalized = normalizeItem(rawItem);
    if (!normalized) {
      continue;
    }

    map.set(itemKey(normalized), {
      ...normalized,
      _id: rawItem?._id,
      addedAt: rawItem?.addedAt || new Date(),
    });
  }

  for (const rawItem of incomingItems) {
    const normalized = normalizeItem(rawItem);
    if (!normalized) {
      continue;
    }

    const key = itemKey(normalized);
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        ...existing,
        quantity: toPositiveInt(existing.quantity + normalized.quantity),
      });
      continue;
    }

    map.set(key, {
      ...normalized,
      addedAt: new Date(),
    });
  }

  return Array.from(map.values());
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

const formatCart = (cart) => ({
  id: cart._id,
  userId: cart.userId,
  items: cart.items,
  totalItems: cart.totalItems,
  subtotal: cart.subtotal,
  updatedAt: cart.updatedAt,
});

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);

    return res.status(200).json({
      success: true,
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch cart",
      message: error.message,
    });
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const normalized = normalizeItem(req.body);
    if (!normalized) {
      return res.status(400).json({
        success: false,
        error: "Invalid cart item payload",
      });
    }

    const cart = await getOrCreateCart(req.userId);
    cart.items = mergeCartItems(cart.items, [normalized]);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to add item to cart",
      message: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const quantity = toPositiveInt(req.body?.quantity, 0);

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be at least 1",
      });
    }

    const cart = await getOrCreateCart(req.userId);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found",
      });
    }

    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update cart item",
      message: error.message,
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.userId);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Cart item not found",
      });
    }

    item.deleteOne();
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart item removed",
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to remove cart item",
      message: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to clear cart",
      message: error.message,
    });
  }
};

export const mergeGuestCart = async (req, res) => {
  try {
    const incomingItems = Array.isArray(req.body?.items) ? req.body.items : [];

    const cart = await getOrCreateCart(req.userId);
    cart.items = mergeCartItems(cart.items, incomingItems);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Guest cart merged",
      data: formatCart(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to merge guest cart",
      message: error.message,
    });
  }
};
