import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const DEFAULT_GOOGLE_CLIENT_ID =
  "647437966024-0ubbv4rmbennr1some8g5o2agr3poanh.apps.googleusercontent.com";

const isValidGoogleClientId = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return false;
  }

  if (/YOUR_(CLIENT_ID|GOOGLE_CLIENT_ID)/i.test(normalized)) {
    return false;
  }

  return /^[0-9]+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(normalized);
};

const GOOGLE_CLIENT_ID = isValidGoogleClientId(process.env.GOOGLE_CLIENT_ID)
  ? process.env.GOOGLE_CLIENT_ID.trim()
  : isValidGoogleClientId(DEFAULT_GOOGLE_CLIENT_ID)
    ? DEFAULT_GOOGLE_CLIENT_ID
    : "";
const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ADMIN_ALLOWLIST = new Set(
  (process.env.ADMIN_ALLOWLIST || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;
const statelessProfiles = new Map();

const isAllowlistedAdmin = (email) =>
  ADMIN_ALLOWLIST.has(String(email || "").toLowerCase());

const toPublicUser = (user) => ({
  id: String(user.id || user._id || user.googleId || user.email || ""),
  googleId: String(user.googleId || ""),
  email: String(user.email || ""),
  name: String(user.name || ""),
  picture: String(user.picture || ""),
  phone: String(user.phone || ""),
  address: user.address || {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
  role: user.role || "user",
  isActive: user.isActive !== false,
  lastLoginAt: user.lastLoginAt || null,
  lastSeenAt: user.lastSeenAt || null,
  createdAt: user.createdAt || null,
  updatedAt: user.updatedAt || null,
});

const emptyAddress = () => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
});

const buildCartFromItems = (userId, items = []) => {
  const safeItems = Array.isArray(items)
    ? items.filter((item) => item && typeof item === "object")
    : [];

  const totalItems = safeItems.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    return sum + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0);

  const subtotal = Number(
    safeItems
      .reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
          return sum;
        }

        return sum + Math.max(0, quantity) * Math.max(0, price);
      }, 0)
      .toFixed(2),
  );

  return {
    id: `stateless-cart-${userId}`,
    userId,
    items: safeItems,
    totalItems,
    subtotal,
    updatedAt: new Date().toISOString(),
  };
};

const profileKeyFor = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const getStoredProfile = (email) => {
  const key = profileKeyFor(email);
  if (!key) {
    return null;
  }

  return statelessProfiles.get(key) || null;
};

const saveStoredProfile = (email, profile) => {
  const key = profileKeyFor(email);
  if (!key) {
    return;
  }

  statelessProfiles.set(key, profile);
};

const signAppToken = (user) =>
  jwt.sign(
    {
      sub: String(user.id || user.googleId || user.email || ""),
      userId: String(user.id || user.googleId || user.email || ""),
      email: user.email,
      name: user.name || "",
      picture: user.picture || "",
      phone: user.phone || "",
      address: user.address || emptyAddress(),
      role: user.role,
      isActive: user.isActive !== false,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

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
    const allowlistedAdmin = isAllowlistedAdmin(normalizedEmail);
    const nowIso = new Date().toISOString();
    const storedProfile = getStoredProfile(normalizedEmail);
    const userId = `google:${payload.sub}`;
    const user = {
      id: userId,
      googleId: payload.sub,
      email: normalizedEmail,
      name: payload.name || storedProfile?.name || "",
      picture: payload.picture || storedProfile?.picture || "",
      phone: storedProfile?.phone || "",
      address: storedProfile?.address || emptyAddress(),
      role: allowlistedAdmin ? "admin" : "user",
      isActive: true,
      lastLoginAt: nowIso,
      lastSeenAt: nowIso,
      createdAt: storedProfile?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const guestCartItems = Array.isArray(req.body?.guestCartItems)
      ? req.body.guestCartItems
      : [];
    const cart = buildCartFromItems(userId, guestCartItems);

    saveStoredProfile(normalizedEmail, {
      name: user.name,
      picture: user.picture,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const token = signAppToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: toPublicUser(user),
        cart,
      },
    });
  } catch (error) {
    const message = String(error?.message || "");
    if (
      message.includes("Wrong number of segments") ||
      message.includes("Token used too late") ||
      message.includes("Invalid token") ||
      message.includes("No pem found") ||
      message.includes("audience")
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid Google credential",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Google authentication failed",
      message: error.message,
    });
  }
};

export const getCurrentSession = async (req, res) => {
  try {
    const currentEmail = String(req.user?.email || "")
      .trim()
      .toLowerCase();
    const storedProfile = getStoredProfile(currentEmail);
    const nowIso = new Date().toISOString();

    const user = {
      ...req.user,
      id: req.user?.id || req.userId,
      name: storedProfile?.name || req.user?.name || "",
      picture: storedProfile?.picture || req.user?.picture || "",
      phone: storedProfile?.phone || req.user?.phone || "",
      address: storedProfile?.address || req.user?.address || emptyAddress(),
      role: storedProfile?.role || req.user?.role || "user",
      isActive: req.user?.isActive !== false,
      lastSeenAt: nowIso,
      updatedAt: nowIso,
    };

    saveStoredProfile(currentEmail, {
      name: user.name,
      picture: user.picture,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: storedProfile?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: toPublicUser(user),
        cart: buildCartFromItems(user.id || req.userId, []),
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
    const nextName =
      typeof req.body?.name === "string"
        ? req.body.name.trim()
        : req.user?.name || "";
    const nextPhone =
      typeof req.body?.phone === "string"
        ? req.body.phone.trim()
        : req.user?.phone || "";

    const rawAddress =
      req.body?.address && typeof req.body.address === "object"
        ? req.body.address
        : req.user?.address || emptyAddress();

    const updatedUser = {
      ...req.user,
      id: req.user?.id || req.userId,
      name: nextName,
      phone: nextPhone,
      address: {
        line1: rawAddress?.line1 || "",
        line2: rawAddress?.line2 || "",
        city: rawAddress?.city || "",
        state: rawAddress?.state || "",
        postalCode: rawAddress?.postalCode || "",
        country: rawAddress?.country || "India",
      },
      updatedAt: new Date().toISOString(),
    };

    saveStoredProfile(updatedUser.email, {
      name: updatedUser.name,
      picture: updatedUser.picture || "",
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role || "user",
      createdAt: updatedUser.createdAt || new Date().toISOString(),
      updatedAt: updatedUser.updatedAt,
    });

    const token = signAppToken(updatedUser);

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        user: toPublicUser(updatedUser),
        token,
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
