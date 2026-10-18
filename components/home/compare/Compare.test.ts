import { describe, expect, it } from "vitest";
import { Compare } from "./Compare";
import { COMPARE_ROWS } from "@/lib/copy";
import {
  attrs,
  childElements,
  findAll,
  findOne,
  textOf,
} from "@/test-utils/react-tree";

const tree = Compare();
const table = findOne(tree, "table");
const head = findOne(table, "thead");
const body = findOne(table, "tbody");

describe("Compare", () => {
  it("renders the matrix as a single real table", () => {
    expect(findAll(tree, "table")).toHaveLength(1);
    expect(childElements(table).map((c) => c.type)).toEqual([
      "caption",
      "thead",
      "tbody",
    ]);
  });

  // Overriding `display` on table elements drops the table role in every
  // engine, and the grid layout depends on doing exactly that — so the roles
  // are re-declared by hand and a missed one is a silent a11y regression.
  it("re-declares the table roles the display override strips", () => {
    expect(attrs(table).role).toBe("table");
    expect(attrs(head).role).toBe("rowgroup");
    expect(attrs(body).role).toBe("rowgroup");
    for (const row of findAll(table, "tr")) expect(attrs(row).role).toBe("row");
    for (const cell of findAll(table, "td"))
      expect(attrs(cell).role).toBe("cell");
    for (const th of findAll(head, "th"))
      expect(attrs(th).role).toBe("columnheader");
    for (const th of findAll(body, "th"))
      expect(attrs(th).role).toBe("rowheader");
  });

  it("names the table from its caption", () => {
    const caption = findOne(table, "caption");
    expect(attrs(table)["aria-labelledby"]).toBe(attrs(caption).id);
    expect(textOf(caption)).toBe(
      "Traditional CDN compared with deCDN across seven axes: price, delivery, billing, operators, integrity, failure, and scaling.",
    );
  });

  it("heads the three columns, axis included", () => {
    const [headRow] = findAll(head, "tr");
    const headings = findAll(headRow, "th");
    expect(headings.map((th) => textOf(th))).toEqual([
      "axis",
      "traditional cdn",
      "decdn/ decentralized",
    ]);
    for (const th of headings) expect(attrs(th).scope).toBe("col");
  });

  // The axis header is invisible by design; `opacity-0` is what keeps the word
  // in the DOM for extractors and in the a11y tree for the rowheaders' scope.
  it("keeps the invisible axis header in the DOM rather than hiding it", () => {
    const [axis] = findAll(head, "th");
    expect(attrs(axis).className).toContain("opacity-0");
    expect(attrs(axis).hidden).toBeUndefined();
    expect(attrs(axis)["aria-hidden"]).toBeUndefined();
  });

  it("renders one body row per axis, in order", () => {
    const rows = findAll(body, "tr");
    expect(rows).toHaveLength(7);
    expect(rows.map((row) => textOf(findAll(row, "th")[0]))).toEqual([
      "price",
      "delivery",
      "billing",
      "operators",
      "integrity",
      "failure",
      "scaling",
    ]);
  });

  it("pairs every stored value with its own cell", () => {
    const rows = findAll(body, "tr");
    COMPARE_ROWS.forEach((row, i) => {
      const [traditional, decdn] = findAll(rows[i], "td");
      expect(textOf(traditional)).toContain(
        row.traditional.replace(" /GB", ""),
      );
      expect(textOf(decdn)).toContain(row.decdn.replace(" /GB", ""));
    });
  });

  // Hardcoded because these are the delays the hand-written rows used before
  // the table replaced them; the formula exists to reproduce them exactly.
  it("reproduces the previous reveal cascade", () => {
    expect(findAll(body, "tr").map((row) => attrs(row).style)).toEqual(
      [340, 420, 480, 540, 600, 660, 720].map((ms) => ({
        "--reveal-delay": `${ms}ms`,
      })),
    );
  });
});
