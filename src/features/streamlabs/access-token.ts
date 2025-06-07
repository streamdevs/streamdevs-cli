import { ENDPOINTS, GRANT_TYPES } from "./config";

import {
  InvalidResponseError,
  MissingTokenError,
  HttpStatusError,
} from "./errors/streamlabs";

export type AccessTokenResponse = {
  token_type: string;
  expires_in: number;
  access_token: string;
};

export function getAuthenticationPayload(
  client_id: string,
  client_secret: string,
  code: string,
  redirect_uri: string,
): {
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
  grant_type: string;
} {
  return {
    code,
    grant_type: GRANT_TYPES.authorization_code,
    client_id,
    client_secret,
    redirect_uri,
  };
}

export function getAccessToken(
  client_id: string,
  client_secret: string,
  code: string,
  redirect_uri: string,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const payload = getAuthenticationPayload(
      client_id,
      client_secret,
      code,
      redirect_uri,
    );
    const response = await fetch(ENDPOINTS.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return reject(new HttpStatusError());
    }

    let data: AccessTokenResponse | undefined;
    try {
      data = await response.json();
    } catch (e) {
      return reject(new InvalidResponseError());
    }

    if (!data?.access_token) {
      return reject(new MissingTokenError());
    }

    resolve(data.access_token);
  });
}
