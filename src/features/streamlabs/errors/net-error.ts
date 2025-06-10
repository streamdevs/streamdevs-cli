import { constants } from "os";

// Very useful to not mistype certain codes, like EACCES (not EACCESS)
export type NetErrorCode = keyof typeof constants.errno;
