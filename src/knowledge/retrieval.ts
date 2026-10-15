export interface Passage {
  id: string;
  title: string;
  source: string;
  text: string;
  page?: number;
}
export interface Hit {
  passage: Passage;
  score: number;
}
export const builtins: Passage[] = [
  {
    id: "fractions-parts",
    title: "Fractions are equal-sized parts",
    source: "Untangle teaching pack · original authored explanation",
    text: "Adding fractions needs a shared denominator because the denominator describes the size of equal parts. Convert to equivalent fractions by multiplying both numerator and denominator by the same number. Add the numerators and keep the shared denominator. Adding denominators changes the part size and does not add the original quantities.",
  },
  {
    id: "fractions-equivalence",
    title: "Different names, the same amount",
    source: "Untangle teaching pack · original authored explanation",
    text: "Equivalent fractions describe the same amount. One half equals two quarters: 1/2 = 2/4. Multiplying or dividing the numerator and denominator by the same nonzero number preserves the value. A fraction such as 5/4 is greater than one: it equals 1.25 or one and one quarter.",
  },
  {
    id: "algebra-balance",
    title: "Keep an equation balanced",
    source: "Untangle teaching pack · original authored explanation",
    text: "To solve a linear equation ax + b = c, subtract b from both sides and divide both sides by a, where a is nonzero. The solution is x = (c - b)/a. Use inverse operations in reverse order. If b is negative, subtracting b means adding its positive opposite. Verify the result by substituting it into the original equation.",
  },
  {
    id: "coding-range",
    title: "Python range excludes its stop",
    source:
      "Python documentation · https://docs.python.org/3/library/stdtypes.html#ranges",
    text: "For a positive step, range(start, stop) starts at start and excludes stop. range(1, 5) produces 1, 2, 3, 4. It does not begin at zero when an explicit start is supplied. sum(range(1, 5)) adds these values and gives 10. Keeping only the last loop value gives 4, which is not the accumulated sum.",
  },
  {
    id: "diagnosis",
    title: "Why ask another question?",
    source: "Untangle diagnostic model · authored model documentation",
    text: "Several possible strategies can produce the same answer. A follow-up question is chosen to make those strategies predict different answers. Model weights represent assumptions within this diagnostic model, not a measured probability about a learner. Inconsistent responses may reflect slips, guessing, changing strategies or an approach the model does not include.",
  },
];
const stop = new Set(
  "a an the is are to of and or in on for by as it its this that with from".split(
    " ",
  ),
);
function tokens(text: string) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (x) => !stop.has(x),
  );
}
export function makePassages(
  source: string,
  text: string,
  page?: number,
): Passage[] {
  if (text.length > 200000)
    throw new Error("Keep extracted text below 200,000 characters.");
  const chunks = text.match(/[\s\S]{1,1000}/g) ?? [];
  return chunks
    .filter((s) => s.trim())
    .map((s, i) => ({
      id: `import:${source}:${page ?? 0}:${i}`,
      title: `${source}${page ? ` · page ${page}` : ""} · passage ${i + 1}`,
      source,
      text: s.trim(),
      page,
    }));
}
export function searchKnowledge(
  query: string,
  passages: Passage[],
  limit = 5,
): Hit[] {
  const terms = [...new Set(tokens(query))];
  if (!terms.length || !passages.length) return [];
  const docs = passages.map((p) => tokens(p.title + " " + p.text));
  const avg = docs.reduce((sum, d) => sum + d.length, 0) / docs.length || 1;
  const freq = new Map(
    terms.map((t) => [t, docs.filter((d) => d.includes(t)).length]),
  );
  return passages
    .map((passage, i) => {
      let score = 0;
      for (const term of terms) {
        const tf = docs[i].filter((t) => t === term).length;
        const df = freq.get(term) ?? 0;
        if (tf)
          score +=
            (Math.log(1 + (docs.length - df + 0.5) / (df + 0.5)) * tf * 2.2) /
            (tf + 1.2 * (0.25 + (0.75 * docs[i].length) / avg));
      }
      return { passage, score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 10)));
}

// Original compact teaching notes for the additional bounded diagnostic packs.
builtins.push(
  {
    id: "order-operations",
    title: "Order of operations",
    source: "Untangle teaching pack · original authored explanation",
    text: "In a sum a + b * c, multiply b and c before adding a. Multiplication has priority over addition. Parentheses change the order. Working left to right without respecting priority can produce a different answer.",
  },
  {
    id: "percentage",
    title: "Percentages are out of 100",
    source: "Untangle teaching pack · original authored explanation",
    text: "To find p percent of a number n, multiply p by n and divide by 100. For example, 20% of 80 is 20 times 80 divided by 100, which is 16. A percentage is a ratio, not an amount to add.",
  },
  {
    id: "area",
    title: "Rectangle area and perimeter",
    source: "Untangle teaching pack · original authored explanation",
    text: "A rectangle area is length times width, measured in square units. The perimeter is twice the sum of length and width, measured in length units. Area and perimeter answer different questions.",
  },
  {
    id: "mean",
    title: "Mean of three numbers",
    source: "Untangle teaching pack · original authored explanation",
    text: "The arithmetic mean is the sum of the numbers divided by their count. For three values, add all three and divide by three. The median is the middle sorted value. The range is the largest minus the smallest. These are distinct statistics.",
  },
  {
    id: "probability",
    title: "Simple probability with equally likely outcomes",
    source: "Untangle teaching pack · original authored explanation",
    text: "When outcomes are equally likely, probability is favourable outcomes divided by total outcomes. The complement is one minus that probability. For example two favourable outcomes out of eight gives 2/8 or 1/4. Check the equally likely assumption.",
  },
  {
    id: "derivatives",
    title: "Power-rule derivatives",
    source: "Untangle teaching pack · original authored explanation",
    text: "The derivative of a times x to power n is a times n times x to power n minus one. Multiply the coefficient by the exponent and reduce the exponent by one. Evaluate this new expression at the requested x, rather than evaluating the original function.",
  },
  {
    id: "vectors",
    title: "Vector dot products",
    source: "Untangle teaching pack · original authored explanation",
    text: "For two-dimensional vectors [a,b] and [c,d], the dot product is a*c + b*d. Multiply corresponding components and add both products. Adding every component, or using only one product, does not compute the dot product.",
  },
);
