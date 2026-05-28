const normalizeValue = (value) => (value == null ? "" : String(value).trim());

export const getRuntimeConfig = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const config = window.__APP_CONFIG__;
  if (!config || typeof config !== "object") {
    return {};
  }

  return {
    apiBaseUrl: normalizeValue(config.apiBaseUrl || config.API_BASE_URL),
    googleClientId: normalizeValue(
      config.googleClientId || config.GOOGLE_CLIENT_ID,
    ),
  };
};
