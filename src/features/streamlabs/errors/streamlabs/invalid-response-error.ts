import { StreamlabsError } from "./streamlabs-error";

export class InvalidResponseError extends StreamlabsError {
  override name = "InvalidResponseError";
}
