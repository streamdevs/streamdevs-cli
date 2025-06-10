import { MockAgent, setGlobalDispatcher } from "undici";
import {
  AccessTokenResponse,
  getAccessToken,
  getAuthenticationPayload,
} from "./access-token";
import { API_HOST, API_PATH, ENDPOINTS, GRANT_TYPES, PATHS } from "./config";
import {
  HttpStatusError,
  InvalidResponseError,
  MissingTokenError,
} from "./errors/streamlabs";

describe("access-token", () => {
  let mockAgent: MockAgent | undefined;

  beforeAll(() => {
    mockAgent = new MockAgent();
    mockAgent.enableCallHistory();
    mockAgent.disableNetConnect();

    // this setting will enable interception on all native `fetch` calls
    setGlobalDispatcher(mockAgent);
  });

  test("correctly calls the /token endpoint", async () => {
    mockAgent!
      .get(API_HOST)
      .intercept({
        method: "POST",
        path: `${API_PATH}${PATHS.token}`,
      })
      .reply(200, {
        access_token: "deadbeef",
      } as AccessTokenResponse);

    await getAccessToken("a", "b", "c", "d");

    const expectedPayload = getAuthenticationPayload("a", "b", "c", "d");
    expect(mockAgent!.getCallHistory()?.firstCall()).toMatchObject({
      fullUrl: ENDPOINTS.token,
      body: JSON.stringify(expectedPayload),
      headers: {
        Accept: "application/json",
      },
      method: "POST",
    });
  });

  test("correctly parses the response", async () => {
    mockAgent!
      .get(API_HOST)
      .intercept({
        method: "POST",
        path: `${API_PATH}${PATHS.token}`,
      })
      .reply(200, {
        access_token: "deadbeef",
      } as AccessTokenResponse);

    const token = await getAccessToken("", "", "", "");

    expect(token).toBe("deadbeef");
  });

  describe("handles Streamlabs errors", () => {
    test("HTTP errors", async () => {
      mockAgent!
        .get(API_HOST)
        .intercept({
          method: "POST",
          path: `${API_PATH}${PATHS.token}`,
        })
        .reply(500, {
          error: "Something went wrong on Streamlabs' side",
        });

      await expect(getAccessToken("", "", "", "")).rejects.toThrow(
        HttpStatusError,
      );
    });

    test("Invalid JSON", async () => {
      mockAgent!
        .get(API_HOST)
        .intercept({
          method: "POST",
          path: `${API_PATH}${PATHS.token}`,
        })
        .reply(200, "{this is invalid json");

      await expect(getAccessToken("", "", "", "")).rejects.toThrow(
        InvalidResponseError,
      );
    });
    test("Missing token", async () => {
      mockAgent!
        .get(API_HOST)
        .intercept({
          method: "POST",
          path: `${API_PATH}${PATHS.token}`,
        })
        .reply(200, {
          message: "These are not the tokens you are looking for",
        });

      await expect(getAccessToken("", "", "", "")).rejects.toThrow(
        MissingTokenError,
      );
    });
  });
});
