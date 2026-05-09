import "react";

declare module "react" {
  interface CSSProperties {
    "--reveal-delay"?: string;
    "--wordmark-h"?: string;
  }
}
