import { StreamlabsError } from "./streamlabs-error";

export class HttpStatusError extends StreamlabsError {
  override name = "HttpStatusError";
}
