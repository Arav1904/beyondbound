import Product from "../models/Product.js";

const DEFAULT_PRIMARY_PRODUCT = {
  name: "Glycomics",
  slug: "glycomics",
  description:
    "Blood sugar focused metabolism enhancer with clinically informed ingredients.",
  category: "supplement",
  price: 1925,
  compareAtPrice: 1984,
  inventory: 100,
  images: [],
  tags: ["primary", "featured", "glycomics"],
  packSizes: [
    { value: "20", label: "20 Capsules", price: 600 },
    { value: "60", label: "60 Capsules", price: 1925 },
  ],
  isPreorderEnabled: true,
  estimatedDispatchDays: 10,
  isActive: true,
};

const enableProductForPreorder = async (product) => {
  if (!product) {
    return null;
  }

  let changed = false;
  if (product.isActive === false) {
    product.isActive = true;
    changed = true;
  }

  if (product.isPreorderEnabled === false) {
    product.isPreorderEnabled = true;
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
    isPreorderEnabled: true,
    $or: [{ slug: "glycomics" }, { tags: { $in: ["primary", "featured"] } }],
  }).sort({ updatedAt: -1 });

  if (activePrimary) {
    return activePrimary;
  }

  const anyActivePreorder = await Product.findOne({
    isActive: true,
    isPreorderEnabled: true,
  }).sort({ updatedAt: -1 });

  if (anyActivePreorder) {
    return anyActivePreorder;
  }

  const existingBySlug = await Product.findOne({ slug: DEFAULT_PRIMARY_PRODUCT.slug });
  if (existingBySlug) {
    return enableProductForPreorder(existingBySlug);
  }

  try {
    return await Product.create(DEFAULT_PRIMARY_PRODUCT);
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await Product.findOne({ slug: DEFAULT_PRIMARY_PRODUCT.slug });
      return enableProductForPreorder(duplicate);
    }

    throw error;
  }
};

export default ensurePrimaryProductExists;
