import { StreamlabsError } from "./streamlabs-error";

export class MissingTokenError extends StreamlabsError {
  override name = "MissingTokenError";
}
