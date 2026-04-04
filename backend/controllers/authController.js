import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { mergeCartItems } from "./cartController.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const toPublicUser = (user) => ({
  id: user._id,
  googleId: user.googleId,
  email: user.email,
  name: user.name,
  picture: user.picture,
  phone: user.phone,
  address: user.address,
  updatedAt: user.updatedAt,
});

const toPublicCart = (cart) => ({
  id: cart._id,
  userId: cart.userId,
  items: cart.items,
  totalItems: cart.totalItems,
  subtotal: cart.subtotal,
  updatedAt: cart.updatedAt,
});

const signAppToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

export const googleSignIn = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({
        success: false,
        error: "Google sign-in is not configured on backend",
      });
    }

    const credential = req.body?.credential;
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing Google credential",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({
        success: false,
        error: "Invalid Google token payload",
      });
    }

    if (payload.email_verified === false) {
      return res.status(401).json({
        success: false,
        error: "Google email is not verified",
      });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: normalizedEmail }],
    });

    if (!user) {
      user = new User({
        googleId: payload.sub,
        email: normalizedEmail,
        name: payload.name || "",
        picture: payload.picture || "",
        provider: "google",
        lastLoginAt: new Date(),
      });
    } else {
      user.googleId = payload.sub;
      user.email = normalizedEmail;
      user.name = payload.name || user.name;
      user.picture = payload.picture || user.picture;
      user.lastLoginAt = new Date();
    }

    await user.save();

    const cart = await getOrCreateCart(user._id);
    const guestCartItems = Array.isArray(req.body?.guestCartItems)
      ? req.body.guestCartItems
      : [];

    if (guestCartItems.length > 0) {
      cart.items = mergeCartItems(cart.items, guestCartItems);
      await cart.save();
    }

    const token = signAppToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: toPublicUser(user),
        cart: toPublicCart(cart),
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Google authentication failed",
      message: error.message,
    });
  }
};

export const getCurrentSession = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.userId);

    return res.status(200).json({
      success: true,
      data: {
        user: toPublicUser(req.user),
        cart: toPublicCart(cart),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch current session",
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const nextName = typeof req.body?.name === "string" ? req.body.name.trim() : req.user.name;
    const nextPhone = typeof req.body?.phone === "string" ? req.body.phone.trim() : req.user.phone;

    const rawAddress = req.body?.address && typeof req.body.address === "object"
      ? req.body.address
      : req.user.address;

    req.user.name = nextName;
    req.user.phone = nextPhone;
    req.user.address = {
      line1: rawAddress?.line1 || "",
      line2: rawAddress?.line2 || "",
      city: rawAddress?.city || "",
      state: rawAddress?.state || "",
      postalCode: rawAddress?.postalCode || "",
      country: rawAddress?.country || "India",
    };

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        user: toPublicUser(req.user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to update profile",
      message: error.message,
    });
  }
};
