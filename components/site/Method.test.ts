import { describe, expect, it } from "vitest";
import { Method } from "./Method";
import { STACK } from "@/lib/copy";
import {
  asElement,
  attrs,
  childElements,
  findAll,
  findOne,
  textOf,
} from "@/test-utils/react-tree";

const section = asElement(Method());
const list = findOne(section, "ul");

describe("Method stack strip", () => {
  // The page and the llms-full.txt mirror both read STACK; this is what keeps
  // the rendered side from dropping a role or reordering without a failure.
  it("renders one cell per STACK item, name over role, in order", () => {
    const cells = childElements(list);
    expect(cells.map((c) => c.type)).toEqual(STACK.map(() => "li"));
    cells.forEach((cell, i) => {
      const [name, role] = childElements(cell);
      expect(textOf(name)).toBe(STACK[i].name);
      expect(textOf(role)).toBe(STACK[i].role);
    });
  });

  it("hides the square marker and names the list by its eyebrow", () => {
    for (const cell of childElements(list)) {
      const [, role] = childElements(cell);
      const [marker] = childElements(role);
      expect(attrs(marker)["aria-hidden"]).toBe(true);
    }
    const id = attrs(list)["aria-labelledby"];
    const eyebrow = findAll(section, "span").find((s) => attrs(s).id === id);
    expect(eyebrow && textOf(eyebrow)).toBe("stack");
  });
});
