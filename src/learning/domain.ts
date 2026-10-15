import {
  type ExtraDomain,
  extraTitles,
  extraExamples,
  extraModels,
  parseExtra,
  predictExtra,
  extraSolution,
  extraInputs,
} from "./extra-domains";
export type Domain = "fractions" | "algebra" | "coding" | ExtraDomain;
export interface Task {
  domain: Domain;
  input: string;
  id: string;
  values: number[];
  display: string;
}
export interface Strategy {
  id: string;
  name: string;
  description: string;
}
const common: Strategy = {
  id: "guess",
  name: "Another approach",
  description:
    "An unmodelled method, a slip, or guessing could also explain the answers.",
};
const models: Record<Domain, Strategy[]> = {
  ...extraModels,
  fractions: [
    {
      id: "correct",
      name: "Equal-sized parts",
      description: "Uses equivalent fractions before adding.",
    },
    {
      id: "across",
      name: "Adding tops and bottoms",
      description: "Adds the numerators and denominators separately.",
    },
    {
      id: "first",
      name: "Keeping the first denominator",
      description: "Adds the numerators and keeps the first denominator.",
    },
    {
      id: "larger",
      name: "Keeping the larger denominator",
      description:
        "Adds the numerators and keeps the larger denominator without scaling.",
    },
    common,
  ],
  algebra: [
    {
      id: "correct",
      name: "Balanced inverse operations",
      description: "Subtracts the constant and divides by the coefficient.",
    },
    {
      id: "sign",
      name: "Constant sign mix-up",
      description: "Adds the constant instead of subtracting it.",
    },
    {
      id: "coefficient",
      name: "Missing division",
      description: "Subtracts the constant but does not divide.",
    },
    {
      id: "multiply",
      name: "Multiplying instead of dividing",
      description: "Multiplies by the coefficient after subtracting.",
    },
    common,
  ],
  coding: [
    {
      id: "correct",
      name: "Exclusive stop and accumulation",
      description: "Adds every value before the range stop.",
    },
    {
      id: "inclusive",
      name: "Including the stop",
      description: "Treats the range stop as included.",
    },
    {
      id: "zero",
      name: "Starting from zero",
      description: "Ignores the explicit range start.",
    },
    {
      id: "last",
      name: "Keeping the last value",
      description: "Uses the last loop value instead of the accumulated sum.",
    },
    common,
  ],
};
export const strategies = (domain: Domain) => models[domain];
export const allDomains: Domain[] = [
  "arithmetic",
  "fractions",
  "percentages",
  "algebra",
  "geometry",
  "statistics",
  "probability",
  "calculus",
  "vectors",
  "coding",
];
export const titles: Record<Domain, string> = {
  ...extraTitles,
  fractions: "Fractions",
  algebra: "Linear equations",
  coding: "Code tracing",
};
export const examples: Record<Domain, string> = {
  ...extraExamples,
  fractions: "3/4 + 1/2",
  algebra: "2x + 3 = 11",
  coding: "sum(range(1, 5))",
};
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}
export function rational(n: number, d = 1): string {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0)
    throw new Error("Use a finite number with a nonzero denominator.");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? String(n) : `${n}/${d}`;
}
const unicode: Record<string, string> = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
};
function normalize(s: string) {
  if (/\d\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]\s*\d/.test(s))
    throw new Error(
      "Mixed-number notation is not supported yet. Use an improper fraction such as 3/2.",
    );
  return s
    .replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, (c) => unicode[c])
    .replace(/[−–]/g, "-")
    .trim();
}
export function parseAnswer(input: string): string {
  if (typeof input !== "string" || input.length > 80)
    throw new Error("Enter a number or fraction, such as 5/4.");
  const s = normalize(input).replace(/\s/g, "");
  if (!/^[+-]?\d{1,7}(?:\/\d{1,7}|\.\d{1,6})?$/.test(s))
    throw new Error(
      "Enter a whole number, fraction or decimal, such as 5/4 or 1.25.",
    );
  if (s.includes("/")) {
    const [n, d] = s.split("/").map(Number);
    return rational(n, d);
  }
  if (s.includes(".")) {
    const places = s.split(".")[1].length;
    return rational(Math.round(Number(s) * 10 ** places), 10 ** places);
  }
  return rational(Number(s));
}
export function parseTask(domain: Domain, input: string): Task {
  if (!models[domain] || typeof input !== "string" || input.length > 160)
    throw new Error("Choose a supported subject and a short problem.");
  const text = normalize(input);
  let values: number[] = [],
    display = "";
  if (domain === "fractions") {
    const m = text.match(
      /^([+-]?\d{1,3})\s*\/\s*(\d{1,2})\s*\+\s*([+-]?\d{1,3})\s*\/\s*(\d{1,2})$/,
    );
    if (!m) throw new Error("Use fraction addition, such as 3/4 + 1/2.");
    values = m.slice(1).map(Number);
    if (!values[1] || !values[3] || values[1] > 24 || values[3] > 24)
      throw new Error("Use denominators from 1 to 24.");
    display = `${values[0]}/${values[1]} + ${values[2]}/${values[3]}`;
  } else if (domain === "algebra") {
    const m = text.match(
      /^([+-]?\d{0,2})x\s*([+-])\s*(\d{1,3})\s*=\s*([+-]?\d{1,4})$/i,
    );
    if (!m) throw new Error("Use ax + b = c, such as 2x + 3 = 11.");
    const a =
      m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
    const b = Number(m[3]) * (m[2] === "-" ? -1 : 1);
    if (!a) throw new Error("The coefficient of x must not be zero.");
    values = [a, b, Number(m[4])];
    display = `${a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${values[2]}`;
  } else if (domain === "coding") {
    const m = text.match(
      /^sum\s*\(\s*range\s*\(\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)\s*\)$/,
    );
    if (!m)
      throw new Error("Use sum(range(start, stop)), such as sum(range(1, 5)).");
    values = m.slice(1).map(Number);
    if (values[0] >= values[1] || values[1] > 30)
      throw new Error("Use 0 ≤ start < stop ≤ 30.");
    display = `sum(range(${values[0]}, ${values[1]}))`;
  }
  if (domain !== "fractions" && domain !== "algebra" && domain !== "coding") {
    const parsed = parseExtra(domain, text);
    values = parsed.values;
    display = parsed.display;
  }
  return {
    domain,
    input: display.replace("−", "-"),
    display,
    values,
    id: `${domain}:${values.join(",")}`,
  };
}
export function predict(task: Task, strategy: string): string | null {
  if (strategy === "guess") return null;
  const [a, b, c, d] = task.values;
  if (task.domain === "fractions") {
    switch (strategy) {
      case "correct":
        return rational(a * d + c * b, b * d);
      case "across":
        return rational(a + c, b + d);
      case "first":
        return rational(a + c, b);
      case "larger":
        return rational(a + c, Math.max(b, d));
    }
  } else if (task.domain === "algebra") {
    switch (strategy) {
      case "correct":
        return rational(c - b, a);
      case "sign":
        return rational(c + b, a);
      case "coefficient":
        return rational(c - b);
      case "multiply":
        return rational((c - b) * a);
    }
  } else if (task.domain === "coding") {
    const sum = (from: number, to: number) =>
      ((to - from) * (from + to - 1)) / 2;
    switch (strategy) {
      case "correct":
        return rational(sum(a, b));
      case "inclusive":
        return rational(sum(a, b + 1));
      case "zero":
        return rational(sum(0, b));
      case "last":
        return rational(b - 1);
    }
  }
  if (
    task.domain !== "fractions" &&
    task.domain !== "algebra" &&
    task.domain !== "coding"
  )
    return predictExtra(task, strategy, rational);
  throw new Error("Unknown strategy.");
}
export function solution(task: Task): string[] {
  const [a, b, c, d] = task.values;
  const answer = predict(task, "correct")!;
  if (task.domain === "fractions") {
    const lcm = (b * d) / gcd(b, d);
    return [
      `Both fractions need equal-sized parts. A shared denominator is ${lcm}.`,
      `${a}/${b} = ${a * (lcm / b)}/${lcm}; ${c}/${d} = ${c * (lcm / d)}/${lcm}.`,
      `Add the numerators and keep that denominator: ${a * (lcm / b) + c * (lcm / d)}/${lcm} = ${answer}.`,
    ];
  }
  if (task.domain === "algebra")
    return [
      `${b < 0 ? "Add" : "Subtract"} ${Math.abs(b)} on both sides: ${a}x = ${c - b}.`,
      `Divide both sides by ${a}: x = ${answer}.`,
    ];
  if (task.domain !== "coding") return extraSolution(task, answer);
  return [
    `range(${a}, ${b}) includes ${Array.from({ length: b - a }, (_, i) => a + i).join(", ")}. The stop ${b} is excluded.`,
    `sum adds those values: ${answer}.`,
  ];
}
const pools = new Map<Domain, Task[]>();
export function tasksFor(domain: Domain): Task[] {
  if (pools.has(domain)) return pools.get(domain)!;
  const result: Task[] = [];
  if (domain === "fractions") {
    for (let b = 2; b <= 10; b++)
      for (let d = 2; d <= 10; d++)
        for (const a of [1, b - 1])
          result.push(parseTask(domain, `${a}/${b} + 1/${d}`));
  } else if (domain === "algebra") {
    for (const a of [2, 3, 4, -2, -3])
      for (let b = -5; b <= 5; b++)
        for (const x of [-2, 1, 3])
          result.push(
            parseTask(
              domain,
              `${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${a * x + b}`,
            ),
          );
  } else if (domain === "coding") {
    for (let a = 1; a <= 8; a++)
      for (let b = a + 2; b <= a + 10; b++)
        result.push(parseTask(domain, `sum(range(${a}, ${b}))`));
  } else
    for (const input of extraInputs(domain))
      result.push(parseTask(domain, input));
  const unique = [...new Map(result.map((t) => [t.id, t])).values()];
  pools.set(domain, unique);
  return unique;
}
