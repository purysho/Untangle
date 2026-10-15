import { type Domain, titles } from "../learning/domain";
const areas: Array<{
  name: string;
  description: string;
  domains: Domain[];
  more: string;
}> = [
  {
    name: "Arithmetic & number",
    description:
      "Whole numbers, fractions, decimals, percentages and number properties.",
    domains: ["arithmetic", "fractions", "percentages"],
    more: "Number theory, primes, divisibility and rational numbers",
  },
  {
    name: "Algebra",
    description: "Equations, expressions, functions and algebraic structures.",
    domains: ["algebra"],
    more: "Quadratic equations, systems, inequalities and abstract algebra",
  },
  {
    name: "Geometry & topology",
    description: "Shapes, measurement, space and transformations.",
    domains: ["geometry"],
    more: "Triangles, circles, trigonometry, transformations and topology",
  },
  {
    name: "Probability & statistics",
    description: "Chance, data, distributions and inference.",
    domains: ["probability", "statistics"],
    more: "Conditional probability, distributions, regression and statistical inference",
  },
  {
    name: "Calculus & analysis",
    description: "Change, accumulation, limits and continuous functions.",
    domains: ["calculus"],
    more: "Limits, integrals, sequences, real analysis and complex analysis",
  },
  {
    name: "Linear algebra",
    description: "Vectors, matrices, transformations and systems.",
    domains: ["vectors"],
    more: "Matrices, eigenvalues, vector spaces and linear transformations",
  },
  {
    name: "Discrete mathematics & combinatorics",
    description: "Counting, graphs, finite structures and algorithms.",
    domains: [],
    more: "Combinatorics, graph theory, permutations and discrete structures",
  },
  {
    name: "Logic, sets & proof",
    description: "Mathematical reasoning and foundations.",
    domains: [],
    more: "Propositional logic, set theory, induction and formal proof",
  },
  {
    name: "Applied mathematics",
    description: "Mathematical models of real systems and decisions.",
    domains: [],
    more: "Differential equations, dynamical systems, optimisation, numerical methods, game theory, information theory and mathematical physics",
  },
];
export function Topics({
  choose,
  search,
}: {
  choose: (d: Domain) => void;
  search: (q: string) => void;
}) {
  return (
    <section className="topics-page">
      <h1>A map of mathematics</h1>
      <p>
        From early number work to advanced mathematics. Each diagnostic pack has
        an explicit scope; other topics can be explored through your source
        library.
      </p>
      <div className="topic-grid">
        {areas.map((a) => (
          <article className="topic-area" key={a.name}>
            <h2>{a.name}</h2>
            <p>{a.description}</p>
            <div className="topic-buttons">
              {a.domains.map((d) => (
                <button key={d} onClick={() => choose(d)}>
                  {titles[d]} <span>Diagnostic pack →</span>
                </button>
              ))}
            </div>
            <p className="fine-print">Wider area: {a.more}.</p>
            <button className="quiet-button" onClick={() => search(a.more)}>
              Search this area in my library ↗
            </button>
            <small>
              Other topics: retrieval only until a checked solver and diagnostic
              model are added.
            </small>
          </article>
        ))}
      </div>
      <p className="fine-print">
        Organisation informed by the supplied Lists of Mathematics Topics. This
        is a navigation map, not a claim that every mathematical topic is solved
        or diagnosed by this release. Add relevant sources to search advanced
        areas.
      </p>
    </section>
  );
}
