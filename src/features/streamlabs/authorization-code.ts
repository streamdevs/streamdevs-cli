import http, { IncomingMessage, ServerResponse } from "node:http";

import { ENDPOINTS, SCOPES } from "./config";

export const successResponse = `StreamDevs CLI has received your Streamlabs API OAuth Authorization Code. 
Thank you! You can close this page now :)`;
const badRequestResponse =
  "Bad request. Query string/search param 'code' not provided.";

export function getAuthorizationUri(
  client_id: string,
  redirect_uri: string,
): URL {
  const authorizationUrl = new URL(ENDPOINTS.authorize);

  authorizationUrl.searchParams.set("client_id", client_id);
  authorizationUrl.searchParams.set("scope", SCOPES.alerts.create);
  authorizationUrl.searchParams.set("redirect_uri", redirect_uri);
  authorizationUrl.searchParams.set("response_type", "code");

  return authorizationUrl;
}

export function listenForAuthorizationCode(
  server: http.Server,
): Promise<string> {
  return new Promise((resolve: (value: string) => void) => {
    server.on(
      "request",
      function handleHTTPRequest(
        request: IncomingMessage,
        response: ServerResponse,
      ) {
        // We will always respond with plain text
        response.setHeader("Content-Type", "text/plain; charset=UTF-8");

        const code = new URLSearchParams(request.url?.substring(1)).get("code");

        if (!code) {
          response.statusCode = 400;
          response.end(badRequestResponse);
          server.close();

          return;
        }

        response.end(successResponse);
        server.close();

        resolve(code);
      },
    );
  });
}
