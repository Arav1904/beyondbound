import mongoose from "mongoose";
import Product from "../models/Product.js";
import { ensurePrimaryProductExists } from "../utils/productBootstrap.js";

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20),
  );
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const normalizePackSizes = (product) => {
  const packSizes = Array.isArray(product.packSizes)
    ? product.packSizes
        .map((item) => ({
          value: String(item?.value || "").trim(),
          label: String(item?.label || "").trim(),
          price: toNonNegativeNumber(item?.price, -1),
        }))
        .filter((item) => item.value && item.label && item.price >= 0)
    : [];

  if (packSizes.length > 0) {
    return packSizes;
  }

  return [
    {
      value: "60",
      label: "60 Capsules",
      price: toNonNegativeNumber(product.price, 1599),
    },
    {
      value: "20",
      label: "20 Capsules",
      price: 1,
    },
  ];
};

const toPublicProduct = (product) => {
  const packSizes = normalizePackSizes(product);

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    inventory: product.inventory,
    images: product.images,
    tags: product.tags,
    packSizes,
    estimatedDispatchDays: Number(product.estimatedDispatchDays || 0),
    isInStock: Number(product.inventory || 0) > 0,
    updatedAt: product.updatedAt,
  };
};

export const getPublicProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const category = String(req.query.category || "").trim();
    const search = String(req.query.search || "").trim();
    if (!category && !search) {
      await ensurePrimaryProductExists();
    }

    const filters = { isActive: true };

    if (category) {
      filters.category = category;
    }

    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filters.$or = [
        { name: regex },
        { slug: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filters).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
      data: products.map(toPublicProduct),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    });
  }
};

export const getPrimaryProduct = async (_req, res) => {
  try {
    await ensurePrimaryProductExists();

    let product = await Product.findOne({
      isActive: true,
      $or: [{ slug: "glycomics" }, { tags: { $in: ["primary", "featured"] } }],
    }).sort({ updatedAt: -1 });

    if (!product) {
      product = await Product.findOne({
        isActive: true,
      }).sort({ updatedAt: -1 });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "No active products found",
      });
    }

    return res.status(200).json({
      success: true,
      data: toPublicProduct(product),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch primary product",
      message: error.message,
    });
  }
};

export const getPublicProductByIdentifier = async (req, res) => {
  try {
    const identifier = String(req.params?.identifier || "").trim();

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: "Product identifier is required",
      });
    }

    const filters = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filters.$or = [{ _id: identifier }, { slug: identifier }];
    } else {
      filters.slug = identifier;
    }

    const product = await Product.findOne(filters);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: toPublicProduct(product),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch product",
      message: error.message,
    });
  }
};
