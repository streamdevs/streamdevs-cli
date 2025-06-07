import http from "node:http";

import { startHttpServer } from "./http-server";
import { PortConflictError } from "./errors/port-conflict-error";
import { PortPermissionError } from "./errors/port-permission-error";
import { NetErrorCode } from "./errors/net-error";

describe("http-server", () => {
  test("http server starts on an unused port", async () => {
    const server = await startHttpServer(1234);
    expect(server).toBeInstanceOf(http.Server);

    // Cleanup
    await new Promise((resolve) => server!.close(resolve));
    expect(server!.listening).toBe(false);
  });

  test("detects conflicts when ports are in use", async () => {
    const port = 1234;

    const server = await startHttpServer(port);
    expect(server).toBeInstanceOf(http.Server);

    // Starting a second server on the same port
    await expect(startHttpServer(port)).rejects.toThrow(PortConflictError);

    // Cleanup
    await new Promise((resolve) => server!.close(resolve));
    expect(server!.listening).toBe(false);
  });

  // Ports below 1024 require elevated permissions on some Operating Systems
  test("detects when we lack permissions to open a port", async () => {
    const serverMock = {
      on: jest.fn(),
      listen: jest.fn(),
    };

    const createServerSpy = jest.spyOn(http, "createServer");
    createServerSpy.mockReturnValue(serverMock as unknown as http.Server);

    serverMock.on.mockImplementation((event, callback) => {
      if (event === "error") {
        callback({
          code: <NetErrorCode>"EACCES",
        } as NodeJS.ErrnoException);
      }
    });

    await expect(startHttpServer(80)).rejects.toThrow(PortPermissionError);

    expect(createServerSpy).toHaveBeenCalledTimes(1);
    expect(serverMock.listen).toHaveBeenCalledTimes(1);

    expect(serverMock.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(serverMock.on).toHaveBeenCalledWith(
      "listening",
      expect.any(Function),
    );
  });
});
