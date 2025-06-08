import http from "node:http";

import { PortConflictError } from "./errors/port-conflict-error";
import { PortPermissionError } from "./errors/port-permission-error";
import { NetErrorCode } from "./errors/net-error";

export function startHttpServer(port: number): Promise<http.Server | null> {
  const server = http.createServer();

  return new Promise((resolve, reject) => {
    server.on("error", (e: NodeJS.ErrnoException) => {

      if (e.code == <NetErrorCode>"EADDRINUSE") {
        return reject(
          new PortConflictError("Port " + port + " is already in use"),
        );
      }

      if (e.code == <NetErrorCode>"EACCES" || e.code == <NetErrorCode>"EPERM") {
        return reject(
          new PortPermissionError(
            "Could not open " + port + ". Check permissions.",
          ),
        );
      }

      // Any other reason gets passed through
      reject(e);
    });

    // only resolve if we succeed listening
    server.on("listening", () => resolve(server));

    // The port might be bound on different ips or interfaces
    // TODO: Try loopback ips, any network interface
    // IPv4 127.0.0.1 and 0.0.0.0
    // IPv6 ::1 and ::

    // We only listen on the host/network our OAuth redirect URI redirects to
    server.listen(port, "localhost");
  });
}
