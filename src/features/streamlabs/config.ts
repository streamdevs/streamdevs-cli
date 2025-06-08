export const API_HOST = "https://streamlabs.com";
export const API_PATH = API_HOST + "/api/v2.0";

export const SCOPES = {
  alerts: {
    create: "alerts.create",
  },
};

export const GRANT_TYPES = {
  authorization_code: "authorization_code",
};

export const PATHS = {
  token: "/token",
  authorize: "/authorize",
};

export const ENDPOINTS = {
  token: `${API_PATH}${PATHS.token}`,
  authorize: `${API_PATH}${PATHS.authorize}`,
};
