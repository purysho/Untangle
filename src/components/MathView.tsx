import type { Task } from "../learning/domain";
export function Fraction({ value }: { value: string }) {
  const [n, d] = value.split("/");
  return d ? (
    <span className="fraction">
      <span>{n}</span>
      <span>{d}</span>
    </span>
  ) : (
    <span>{n}</span>
  );
}
export function Problem({ task }: { task: Task }) {
  if (task.domain === "fractions") {
    const [a, b, c, d] = task.values;
    return (
      <div className="math-expression">
        <Fraction value={`${a}/${b}`} />
        <span className="plus">+</span>
        <Fraction value={`${c}/${d}`} />
        <span className="equals">=</span>
        <span className="answer-slot">?</span>
      </div>
    );
  }
  return (
    <div
      className={`math-expression ${task.domain === "coding" ? "code-expression" : ""}`}
    >
      {task.display}
    </div>
  );
}
export function FractionVisual({ task }: { task: Task }) {
  if (task.domain !== "fractions") return null;
  const [a, b, c, d] = task.values;
  if (a < 0 || c < 0 || a > b * 2 || c > d * 2)
    return (
      <p className="visual-note">
        Use the equivalent-fraction steps below to compare these signed or
        larger quantities.
      </p>
    );
  return (
    <div className="fraction-visual">
      <h3>See the parts</h3>
      <svg
        viewBox="0 0 540 150"
        role="img"
        aria-label={`Fraction bars for ${a}/${b} and ${c}/${d}. The whole bars are the same size.`}
      >
        {[
          [a, b],
          [c, d],
        ].map(([n, den], row) => (
          <g key={row}>
            <text x="0" y={row * 70 + 27} fill="#345c51" fontSize="17">
              {n}/{den}
            </text>
            {Array.from(
              { length: Math.max(1, Math.ceil(n / den)) },
              (_, unit) => (
                <g key={unit}>
                  {Array.from({ length: den }, (_, i) => (
                    <rect
                      key={i}
                      x={62 + (i * 200) / den + unit * 220}
                      y={row * 70 + 6}
                      width={200 / den - 1}
                      height="35"
                      rx="2"
                      fill={unit * den + i < n ? "#48a486" : "#e8eee9"}
                      stroke="#fff"
                    />
                  ))}
                </g>
              ),
            )}
          </g>
        ))}
      </svg>
      <p>
        The whole bars have the same size. The denominator tells us how many
        equal pieces make a whole.
      </p>
    </div>
  );
}
