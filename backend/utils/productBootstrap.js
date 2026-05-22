import Product from "../models/Product.js";

const DEFAULT_PRIMARY_PRODUCT = {
  name: "Glycomics",
  slug: "glycomics",
  description:
    "Blood sugar focused metabolism enhancer with clinically informed ingredients.",
  category: "supplement",
  price: 1599,
  compareAtPrice: 1984,
  inventory: 100,
  images: [],
  tags: ["primary", "featured", "glycomics"],
  packSizes: [
    { value: "20", label: "20 Capsules", price: 600 },
    { value: "60", label: "60 Capsules", price: 1599},
  ],
  estimatedDispatchDays: 10,
  isActive: true,
};

const ensureActiveProduct = async (product) => {
  if (!product) {
    return null;
  }

  let changed = false;
  if (product.isActive === false) {
    product.isActive = true;
    changed = true;
  }

  if (changed) {
    await product.save();
  }

  return product;
};

export const ensurePrimaryProductExists = async () => {
  const activePrimary = await Product.findOne({
    isActive: true,
    $or: [{ slug: "glycomics" }, { tags: { $in: ["primary", "featured"] } }],
  }).sort({ updatedAt: -1 });

  if (activePrimary) {
    return activePrimary;
  }

  const anyActiveProduct = await Product.findOne({
    isActive: true,
  }).sort({ updatedAt: -1 });

  if (anyActiveProduct) {
    return anyActiveProduct;
  }

  const existingBySlug = await Product.findOne({
    slug: DEFAULT_PRIMARY_PRODUCT.slug,
  });
  if (existingBySlug) {
    return ensureActiveProduct(existingBySlug);
  }

  try {
    return await Product.create(DEFAULT_PRIMARY_PRODUCT);
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await Product.findOne({
        slug: DEFAULT_PRIMARY_PRODUCT.slug,
      });
      return ensureActiveProduct(duplicate);
    }

    throw error;
  }
};

export default ensurePrimaryProductExists;
