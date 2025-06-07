import {
  AccessTokenResponse,
  getAccessToken,
  getAuthenticationPayload,
} from "./access-token";
import { ENDPOINTS, GRANT_TYPES } from "./config";
import {
  HttpStatusError,
  InvalidResponseError,
  MissingTokenError,
} from "./errors/streamlabs";

describe("access-token", () => {
  type OriginalFetch = typeof global.fetch;
  const fetchMock = fetch as jest.Mock<
    ReturnType<OriginalFetch>,
    Parameters<OriginalFetch>
  >;

  test("correctly calls the /token endpoint", async () => {
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({ access_token: "deadbeef" } as AccessTokenResponse),
          {},
        ),
      );
    });

    await getAccessToken("a", "b", "c", "d");

    expect(fetchMock).toHaveBeenCalledWith(ENDPOINTS.token, {
      body: JSON.stringify({
        code: "c",
        grant_type: GRANT_TYPES.authorization_code,
        client_id: "a",
        client_secret: "b",
        redirect_uri: "d",
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
    });
  });

  test("correctly parses the response", async () => {
    fetchMock.mockImplementation(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({ access_token: "beef" } as AccessTokenResponse),
          {
            status: 200,
          },
        ),
      );
    });

    const token = await getAccessToken("", "", "", "");

    expect(token).toBe("beef");
  });

  describe("handles Streamlabs errors", () => {
    test("HTTP errors", async () => {
      fetchMock.mockImplementation(() => {
        return Promise.resolve(
          new Response("", {
            status: 500,
          }),
        );
      });

      await expect(getAccessToken("", "", "", "")).rejects.toThrow(
        HttpStatusError,
      );
    });

    test("Invalid JSON", () => {
      fetchMock.mockImplementation(() => {
        return Promise.resolve(
          new Response("{", {
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
            status: 200,
          }),
        );
      });

      expect(getAccessToken("", "", "", "")).rejects.toThrow(
        InvalidResponseError,
      );
    });
    test("Missing token", () => {
      fetchMock.mockImplementation(() => {
        return Promise.resolve(
          new Response(
            `{"message": "These are not the tokens you are looking for"}`,
            {
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
              },
              status: 200,
            },
          ),
        );
      });

      expect(getAccessToken("", "", "", "")).rejects.toThrow(MissingTokenError);
    });
  });
});
