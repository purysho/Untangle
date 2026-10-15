export type Severity = "warning" | "review";
export interface Step {
  id: string;
  text: string;
  start: number;
  end: number;
  conditional: boolean;
}
export interface Finding {
  id: string;
  step: string;
  rule: string;
  severity: Severity;
  title: string;
  explanation: string;
  suggestion: string;
  start: number;
  end: number;
}
export interface Edge {
  from: string;
  to: string;
  kind: "explicit" | "order";
  reason: string;
}
export interface Analysis {
  version: "0.1.0";
  source: string;
  steps: Step[];
  findings: Finding[];
  edges: Edge[];
}
interface Rule {
  id: string;
  pattern: RegExp;
  severity: Severity;
  title: string;
  explanation: string;
  suggestion: string;
}
export const rules: Rule[] = [
  {
    id: "vague",
    pattern:
      /\b(as required|as necessary|appropriate(?:ly)?|adequate(?:ly)?|carefully|regularly|soon|some|several)\b/gi,
    severity: "warning",
    title: "Acceptance criteria are unclear",
    explanation:
      "The reader must choose a quantity, timing, method, or acceptance condition that the instruction does not state.",
    suggestion:
      "Give the applicable measurable limit, interval, or named procedure. Do not invent a value.",
  },
  {
    id: "reference",
    pattern: /\b(it|they|them|this|that|these|those)\b/gi,
    severity: "review",
    title: "Possible unclear reference",
    explanation:
      "This word may refer to more than one object. The rule does not resolve grammatical context.",
    suggestion:
      "Check the antecedent. Repeat the component name if the reference is unclear.",
  },
  {
    id: "compound",
    pattern:
      /\band\s+(?:then\s+)?(?:remove|install|check|inspect|tighten|open|close|disconnect|connect|record|clean|replace|adjust|verify)\b/gi,
    severity: "review",
    title: "Multiple actions in one step",
    explanation:
      "An additional imperative may hide a separate action or prerequisite.",
    suggestion:
      "Consider separate numbered steps. Preserve any required sequence and conditions.",
  },
  {
    id: "passive",
    pattern:
      /\b(?:(?:must|shall|should)\s+be|is|are|was|were|be)\s+(?:removed|installed|checked|inspected|tightened|opened|closed|disconnected|connected|recorded|cleaned|replaced|adjusted|verified)\b/gi,
    severity: "review",
    title: "Action is expressed passively",
    explanation: "The instruction can obscure who performs the action.",
    suggestion:
      "If this is an instruction, consider a direct imperative with a named object.",
  },
  {
    id: "optional",
    pattern: /\b(should|may|might|could)\b/gi,
    severity: "review",
    title: "Obligation may be unclear",
    explanation:
      "The reader may not know whether this action is required, permitted, or conditional.",
    suggestion:
      "State the intended obligation or explicit condition. Preserve the author’s technical meaning.",
  },
];

export function analyse(source: string): Analysis {
  if (source.length > 20000) throw new Error("Use 20,000 characters or fewer.");
  const steps: Step[] = [];
  const findings: Finding[] = [];
  const edges: Edge[] = [];
  let offset = 0;
  for (const line of source.split("\n")) {
    const clean = line.trim();
    if (clean && steps.length >= 200)
      throw new Error("Use 200 steps or fewer.");
    if (clean) {
      const numbered = clean.match(/^(\d+)[.)]\s*/);
      const id = numbered?.[1] ?? `L${steps.length + 1}`;
      if (steps.some((s) => s.id === id))
        throw new Error(
          `Duplicate step number ${id}. Use unique step numbers.`,
        );
      const start = offset + line.indexOf(clean) + (numbered?.[0].length ?? 0);
      const text = clean.slice(numbered?.[0].length ?? 0);
      steps.push({
        id,
        text,
        start,
        end: start + text.length,
        conditional: /\b(if|unless|when|until)\b/i.test(text),
      });
    }
    offset += line.length + 1;
  }
  const add = (
    step: Step,
    rule: string,
    title: string,
    explanation: string,
    suggestion: string,
    start = step.start,
    end = step.end,
    severity: Severity = "warning",
  ) =>
    findings.push({
      id: `F${findings.length + 1}`,
      step: step.id,
      rule,
      title,
      explanation,
      suggestion,
      start,
      end,
      severity,
    });
  for (const [i, step] of steps.entries()) {
    if (i > 0)
      edges.push({
        from: steps[i - 1].id,
        to: step.id,
        kind: "order",
        reason: "Document order only; prerequisite not established.",
      });
    for (const rule of rules)
      for (const match of step.text.matchAll(new RegExp(rule.pattern)))
        add(
          step,
          rule.id,
          rule.title,
          rule.explanation,
          rule.suggestion,
          step.start + match.index,
          step.start + match.index + match[0].length,
          rule.severity,
        );
    const words = step.text.match(/\b[\w'-]+\b/g) ?? [];
    if (words.length > 25)
      add(
        step,
        "length",
        "Long instruction",
        `This step contains ${words.length} words. Long sentences may hide conditions or actions. This heuristic is not a formal STE word count.`,
        "Review the instruction for separable actions and conditions.",
        step.start,
        step.end,
        "review",
      );
    for (const match of step.text.matchAll(
      /\b(after|before)\s+(?:you\s+)?(?:complete\s+)?step\s+(\d+(?:\.\d+)*)\b/gi,
    )) {
      const target = match[2];
      if (target.includes(".")) {
        add(
          step,
          "unsupported-reference",
          "Unsupported subsection reference",
          "Decimal subsection references cannot be resolved by this parser. No explicit edge was added.",
          "Use supported integer step IDs or review this dependency manually.",
          step.start + match.index,
          step.start + match.index + match[0].length,
        );
        continue;
      }
      if (/\b(not|never|avoid|unless|until)\b/i.test(step.text)) {
        add(
          step,
          "negated-dependency",
          "Dependency meaning needs review",
          "Negation or limiting language can change the meaning of a timing reference. No explicit edge was added.",
          "Review the complete clause and record the intended prerequisite explicitly.",
          step.start,
          step.end,
        );
        continue;
      }
      if (!steps.some((s) => s.id === target)) {
        add(
          step,
          "missing-step",
          `Step ${target} does not exist`,
          "An explicit dependency points to a missing numbered step.",
          "Correct the reference or include the missing step.",
          step.start + match.index,
          step.start + match.index + match[0].length,
        );
        continue;
      }
      const from = match[1].toLowerCase() === "after" ? target : step.id;
      const to = from === target ? step.id : target;
      if (
        !edges.some(
          (e) => e.kind === "explicit" && e.from === from && e.to === to,
        )
      )
        edges.push({ from, to, kind: "explicit", reason: match[0] });
    }
  }
  // Iterative reachability avoids recursion limits for large procedures.
  const adjacency = new Map(
    steps.map((s) => [
      s.id,
      edges
        .filter((e) => e.kind === "explicit" && e.from === s.id)
        .map((e) => e.to),
    ]),
  );
  for (const step of steps) {
    const pending = [...(adjacency.get(step.id) ?? [])];
    const seen = new Set<string>();
    let cycle = false;
    while (pending.length) {
      const next = pending.pop()!;
      if (next === step.id) {
        cycle = true;
        break;
      }
      if (!seen.has(next)) {
        seen.add(next);
        pending.push(...(adjacency.get(next) ?? []));
      }
    }
    if (cycle)
      add(
        step,
        "cycle",
        "Circular dependency",
        "Explicit references place this step in a cycle. No valid ordering satisfies these references.",
        "Review the referenced step numbers and intended sequence.",
      );
  }
  return { version: "0.1.0", source, steps, findings, edges };
}
