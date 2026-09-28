import "react";

declare module "react" {
  interface CSSProperties {
    "--reveal-delay"?: `${number}ms`;
    "--faq-n"?: number;
    "--level"?: number;
  }
}
