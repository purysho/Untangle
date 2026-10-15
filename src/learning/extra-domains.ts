import type { Strategy, Task } from "./domain";
export type ExtraDomain =
  | "arithmetic"
  | "percentages"
  | "geometry"
  | "statistics"
  | "probability"
  | "calculus"
  | "vectors";
export const extraTitles: Record<ExtraDomain, string> = {
  arithmetic: "Order of operations",
  percentages: "Percentages",
  geometry: "Rectangle area",
  statistics: "Mean of three numbers",
  probability: "Simple probability",
  calculus: "Power-rule derivatives",
  vectors: "Vector dot products",
};
export const extraExamples: Record<ExtraDomain, string> = {
  arithmetic: "2 + 3 * 4",
  percentages: "20% of 80",
  geometry: "rectangle 4 x 7",
  statistics: "mean(2, 4, 9)",
  probability: "probability 2 of 8",
  calculus: "derivative 3x^2 at 2",
  vectors: "dot([1,2],[3,4])",
};
const definitions: Record<ExtraDomain, [string, string][]> = {
  arithmetic: [
    ["correct", "Multiplication before addition"],
    ["left", "Working left to right"],
    ["add", "Adding every number"],
    ["multiply", "Multiplying every number"],
  ],
  percentages: [
    ["correct", "Percent means out of 100"],
    ["add", "Adding the percentage"],
    ["scale", "Missing division by 100"],
    ["reverse", "Reversing the ratio"],
  ],
  geometry: [
    ["correct", "Length times width"],
    ["perimeter", "Using the perimeter"],
    ["side", "Using one side"],
    ["sum", "Adding the sides"],
  ],
  statistics: [
    ["correct", "Sum divided by count"],
    ["sum", "Missing division by count"],
    ["range", "Using the range"],
    ["median", "Using the median"],
  ],
  probability: [
    ["correct", "Favourable over total"],
    ["complement", "Using the complement"],
    ["reverse", "Reversing the fraction"],
    ["difference", "Subtracting the counts"],
  ],
  calculus: [
    ["correct", "Apply the power rule"],
    ["power", "Power not reduced"],
    ["factor", "Missing the exponent factor"],
    ["original", "Evaluating the original function"],
  ],
  vectors: [
    ["correct", "Sum corresponding products"],
    ["sum", "Adding all components"],
    ["first", "Only the first product"],
    ["last", "Only the second product"],
  ],
};
export const extraModels = Object.fromEntries(
  Object.entries(definitions).map(([d, items]) => [
    d,
    [
      ...items.map(([id, name]) => ({ id, name, description: name + "." })),
      {
        id: "guess",
        name: "Another approach",
        description: "An unmodelled method, a slip, or guessing.",
      },
    ],
  ]),
) as Record<ExtraDomain, Strategy[]>;
export function parseExtra(
  domain: ExtraDomain,
  text: string,
): { values: number[]; display: string } {
  const patterns: Record<ExtraDomain, RegExp> = {
    arithmetic: /^(\d{1,2})\s*\+\s*(\d{1,2})\s*\*\s*(\d{1,2})$/,
    percentages: /^(\d{1,3})%\s+of\s+(\d{1,3})$/i,
    geometry: /^rectangle\s+(\d{1,2})\s*[x×]\s*(\d{1,2})$/i,
    statistics: /^mean\(\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)$/i,
    probability: /^probability\s+(\d{1,2})\s+of\s+(\d{1,2})$/i,
    calculus: /^derivative\s+(\d{1,2})x\^(\d)\s+at\s+(\d)$/i,
    vectors:
      /^dot\(\[\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\],\[\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\]\)$/i,
  };
  const m = text.match(patterns[domain]);
  if (!m) throw new Error(`Use this supported form: ${extraExamples[domain]}`);
  const values = m.slice(1).map(Number);
  const [a, b, c] = values;
  if (domain === "probability" && (b === 0 || a > b))
    throw new Error(
      "Favourable outcomes must be between 0 and the positive total.",
    );
  if (domain === "calculus" && (b < 1 || b > 5))
    throw new Error(
      "Use powers from 1 to 5 and an evaluation point from 0 to 9.",
    );
  if (domain === "percentages" && a === 0)
    throw new Error("Use a percentage from 1 to 999.");
  return { values, display: text };
}
export function predictExtra(
  task: Task,
  id: string,
  r: (n: number, d?: number) => string,
): string {
  const [a, b, c, d] = task.values;
  let value: number;
  switch (task.domain) {
    case "arithmetic":
      value =
        id === "correct"
          ? a + b * c
          : id === "left"
            ? (a + b) * c
            : id === "add"
              ? a + b + c
              : a * b * c;
      break;
    case "percentages":
      return id === "correct"
        ? r(a * b, 100)
        : id === "add"
          ? r(a + b)
          : id === "scale"
            ? r(a * b)
            : r(b, a);
    case "geometry":
      value =
        id === "correct"
          ? a * b
          : id === "perimeter"
            ? 2 * (a + b)
            : id === "side"
              ? a
              : a + b;
      break;
    case "statistics":
      return id === "correct"
        ? r(a + b + c, 3)
        : id === "sum"
          ? r(a + b + c)
          : id === "range"
            ? r(Math.max(a, b, c) - Math.min(a, b, c))
            : r([a, b, c].sort((x, y) => x - y)[1]);
    case "probability":
      return id === "correct"
        ? r(a, b)
        : id === "complement"
          ? r(b - a, b)
          : id === "reverse"
            ? a === 0
              ? "0"
              : r(b, a)
            : r(b - a);
    case "calculus":
      value =
        id === "correct"
          ? a * b * c ** (b - 1)
          : id === "power"
            ? a * b * c ** b
            : id === "factor"
              ? a * c ** (b - 1)
              : a * c ** b;
      break;
    case "vectors":
      value =
        id === "correct"
          ? a * c + b * d
          : id === "sum"
            ? a + b + c + d
            : id === "first"
              ? a * c
              : b * d;
      break;
    default:
      throw new Error("Unknown topic.");
  }
  return r(value);
}
export function extraSolution(task: Task, answer: string): string[] {
  const [a, b, c, d] = task.values;
  switch (task.domain) {
    case "arithmetic":
      return [
        `Multiply first: ${b} × ${c} = ${b * c}.`,
        `Then add ${a}: ${a} + ${b * c} = ${answer}.`,
      ];
    case "percentages":
      return [
        `${a}% means ${a}/100.`,
        `Multiply by ${b}: (${a} × ${b})/100 = ${answer}.`,
      ];
    case "geometry":
      return [
        "A rectangle’s area is length × width, measured in square units.",
        `${a} × ${b} = ${answer} square units. Perimeter is a different measurement.`,
      ];
    case "statistics":
      return [
        `Add the three values: ${a} + ${b} + ${c} = ${a + b + c}.`,
        `Divide by 3 to find the mean: ${answer}.`,
      ];
    case "probability":
      return [
        `For equally likely outcomes, probability = favourable outcomes / total outcomes.`,
        `${a}/${b} = ${answer}. The outcomes must be equally likely for this model.`,
      ];
    case "calculus":
      return [
        `Power rule: d/dx (${a}x^${b}) = ${a * b}x^${b - 1}.`,
        `At x = ${c}, this derivative is ${answer}.`,
      ];
    case "vectors":
      return [
        `Multiply corresponding components: ${a} × ${c} = ${a * c}; ${b} × ${d} = ${b * d}.`,
        `Add the products: ${a * c} + ${b * d} = ${answer}.`,
      ];
    default:
      return [];
  }
}
export function extraInputs(domain: ExtraDomain): string[] {
  const result: string[] = [];
  for (let a = 2; a <= 7; a++)
    for (let b = 3; b <= 9; b++) {
      switch (domain) {
        case "arithmetic":
          result.push(`${a} + ${b} * ${a + 1}`);
          break;
        case "percentages":
          result.push(`${a * 5}% of ${b * 10}`);
          break;
        case "geometry":
          result.push(`rectangle ${a} x ${b}`);
          break;
        case "statistics":
          result.push(`mean(${a}, ${b}, ${a + b + 2})`);
          break;
        case "probability":
          result.push(`probability ${a} of ${a + b}`);
          break;
        case "calculus":
          result.push(`derivative ${a}x^${2 + (b % 3)} at ${1 + (a % 4)}`);
          break;
        case "vectors":
          result.push(`dot([${a},${b}],[${a + 1},${b + 2}])`);
          break;
      }
    }
  return result;
}
