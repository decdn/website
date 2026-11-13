import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import { highlightBrand } from "./brand";

describe("highlightBrand", () => {
  it("wraps the brand and normalises its casing", () => {
    const parts = highlightBrand("Run DeCdn today.");
    const brand = parts.find(isValidElement);
    expect(brand?.props).toMatchObject({ children: "deCDN" });
  });

  // The FAQ names the CLI; `decdn setup` rendered as "deCDN setup" is a
  // command that doesn't exist.
  it("leaves the lowercase CLI name alone", () => {
    expect(
      highlightBrand("run decdn setup, then decdn-node run").join(""),
    ).toBe("run decdn setup, then decdn-node run");
  });
});
