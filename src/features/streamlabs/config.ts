const API_URI = "https://streamlabs.com/api/v2.0";

export const SCOPES = {
  alerts: {
    create: "alerts.create",
  },
};

export const GRANT_TYPES = {
  authorization_code: "authorization_code",
};

export const ENDPOINTS = {
  token: `${API_URI}/token`,
  authorize: `${API_URI}/authorize`,
};
