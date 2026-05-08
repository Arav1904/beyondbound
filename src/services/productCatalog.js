export const FALLBACK_PRIMARY_PRODUCT = {
  id: "glycomics",
  slug: "glycomics",
  name: "Glycomics",
  description:
    "Blood sugar focused metabolism enhancer with clinically informed ingredients.",
  price: 600,
  compareAtPrice: 800,
  images: [],
  packSizes: [
    { value: "20", label: "20 Capsules", price: 600 },
    { value: "60", label: "60 Capsules", price: 1599 },
  ],
  isPreorderEnabled: true,
  estimatedDispatchDays: 10,
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

export const normalizePackSizes = (product) => {
  const source = Array.isArray(product?.packSizes) ? product.packSizes : [];

  const normalized = source
    .map((pack) => ({
      value: String(pack?.value || "").trim(),
      label: String(pack?.label || "").trim(),
      price: toNonNegativeNumber(pack?.price, -1),
    }))
    .filter((pack) => pack.value && pack.label && pack.price >= 0)
    .sort((a, b) => Number(a.value) - Number(b.value));

  if (normalized.length > 0) {
    return normalized;
  }

  return FALLBACK_PRIMARY_PRODUCT.packSizes;
};

export const normalizePrimaryProduct = (product) => {
  if (!product || typeof product !== "object") {
    return FALLBACK_PRIMARY_PRODUCT;
  }

  const normalized = {
    ...FALLBACK_PRIMARY_PRODUCT,
    ...product,
    id: String(product.id || product._id || FALLBACK_PRIMARY_PRODUCT.id),
    slug: String(product.slug || FALLBACK_PRIMARY_PRODUCT.slug),
    name: String(product.name || FALLBACK_PRIMARY_PRODUCT.name),
    description: String(
      product.description || FALLBACK_PRIMARY_PRODUCT.description,
    ),
    price: toNonNegativeNumber(product.price, FALLBACK_PRIMARY_PRODUCT.price),
    compareAtPrice: toNonNegativeNumber(
      product.compareAtPrice,
      FALLBACK_PRIMARY_PRODUCT.compareAtPrice,
    ),
    images: Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : FALLBACK_PRIMARY_PRODUCT.images,
    isPreorderEnabled: product.isPreorderEnabled !== false,
    estimatedDispatchDays: toNonNegativeNumber(
      product.estimatedDispatchDays,
      FALLBACK_PRIMARY_PRODUCT.estimatedDispatchDays,
    ),
  };

  normalized.packSizes = normalizePackSizes(normalized);

  return normalized;
};

export const getPrimaryImage = (product, fallbackImage = "") => {
  const image =
    Array.isArray(product?.images) && product.images.length > 0
      ? String(product.images[0])
      : "";

  return image || String(fallbackImage || "");
};

export const buildPrimaryCartItem = (
  product,
  { sizeValue = "60", quantity = 1, fallbackImage = "" } = {},
) => {
  const normalized = normalizePrimaryProduct(product);
  const sizes = normalizePackSizes(normalized);
  const selectedSize =
    sizes.find((size) => size.value === String(sizeValue)) ||
    sizes[sizes.length - 1] ||
    FALLBACK_PRIMARY_PRODUCT.packSizes[1];

  const productKey = normalized.slug || normalized.id || "glycomics";

  return {
    productId: `${productKey}-${selectedSize.value}`,
    productName: `${normalized.name} (${selectedSize.label})`,
    price: toNonNegativeNumber(selectedSize.price, normalized.price),
    quantity: toPositiveInt(quantity, 1),
    size: selectedSize.value,
    image: getPrimaryImage(normalized, fallbackImage),
  };
};

export const buildPrimaryPreorderDraft = (
  product,
  { sizeValue = "20", quantity = 1, fallbackImage = "" } = {},
) => {
  const normalized = normalizePrimaryProduct(product);
  const sizes = normalizePackSizes(normalized);
  const selectedSize =
    sizes.find((size) => size.value === String(sizeValue)) ||
    sizes[sizes.length - 1] ||
    FALLBACK_PRIMARY_PRODUCT.packSizes[1];

  return {
    productId: String(normalized.id || normalized.slug || "glycomics"),
    productSlug: String(normalized.slug || "glycomics"),
    productName: String(normalized.name || "Glycomics"),
    image: getPrimaryImage(normalized, fallbackImage),
    size: String(selectedSize.value || ""),
    sizeLabel: String(selectedSize.label || ""),
    quantity: toPositiveInt(quantity, 1),
    unitPrice: toNonNegativeNumber(selectedSize.price, normalized.price),
  };
};
