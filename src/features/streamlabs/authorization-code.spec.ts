import { listenForAuthorizationCode } from "./authorization-code";
import http from "node:http";
import request from "supertest";

describe("listenForAuthorizationCode", () => {
  let serverMock: http.Server;
  let serverClose: vi.SpyInstance;

  beforeEach(() => {
    serverMock = http.createServer();
    serverClose = vi.spyOn(serverMock, "close");
  });
  afterEach(() => {
    if (serverMock.listening) {
      throw new Error("Test left mock HTTP server listening");
    }
  });
  test("handles requests without auth code", async () => {
    const promise = listenForAuthorizationCode(serverMock);

    request(serverMock).get("/favicon.ico").expect(400);

    // the server is still waiting for a valid request.
    // we explicitly stop it
    serverMock.close();
  });
  test("handles requests with auth code", async () => {
    const promise = listenForAuthorizationCode(serverMock);

    const response = await request(serverMock).get("/?code=deadbeef");

    // our function MUST resolve with the correct code
    await expect(promise).resolves.toBe("deadbeef");

    // we MUST have responded with a valid HTTP response
    expect(response.statusCode).toBe(200);

    // we MUST have stopped the HTTP server since we don't need it anymore
    expect(serverMock.listening).toBe(false);
    expect(serverClose).toHaveBeenCalledTimes(1);
  });
});
