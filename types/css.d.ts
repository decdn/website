import "react";

declare module "react" {
  interface CSSProperties {
    "--reveal-delay"?: `${number}ms`;
    "--wordmark-h"?: string;
    "--mm-i"?: number;
  }
}
