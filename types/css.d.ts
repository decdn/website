import "react";

declare module "react" {
  interface CSSProperties {
    "--reveal-delay"?: `${number}ms`;
    "--mm-i"?: number;
  }
}
