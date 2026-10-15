import { useState } from "react";
import {
  type Session,
  assessment,
  entropy,
  informationGain,
  nextTask,
  makeSession,
  record,
} from "../learning/inference";
import { predict } from "../learning/domain";
export function Inspector({ session }: { session: Session }) {
  const [at, setAt] = useState(-1);
  let shown = makeSession(session.domain);
  const count =
    at < 0 ? session.events.length : Math.min(at, session.events.length);
  for (const event of session.events.slice(0, count))
    shown = record(shown, event.task, event.answer);
  const info = assessment(shown);
  const next = nextTask(
    shown.domain,
    shown.posterior,
    shown.events.map((e) => e.task.id),
  );
  const last = shown.events.at(-1);
  return (
    <details className="reasoning">
      <summary>
        Show the reasoning{" "}
        <span>For curious learners, teachers & developers</span>
      </summary>
      <div className="reasoning-body">
        <h3>What could explain these answers?</h3>
        <p>
          These are weights inside an authored model—not measured probabilities
          about a learner. One answer can fit several explanations.
        </p>
        <label className="replay-label">
          Replay evidence: {count} of {session.events.length} answers
          <input
            type="range"
            min="0"
            max={session.events.length}
            value={count}
            onChange={(e) => setAt(Number(e.target.value))}
          />
        </label>
        <svg
          className="inference-graph"
          viewBox="0 0 800 285"
          role="img"
          aria-label="Evidence connects the learner response to competing strategy hypotheses. Wider lines indicate larger model weights."
        >
          <rect
            x="12"
            y="112"
            width="180"
            height="62"
            rx="12"
            fill="#edf5ef"
            stroke="#b4cdbb"
          />
          <text x="28" y="137" fontSize="13" fill="#426b50">
            {last ? "Observed answer" : "No answer yet"}
          </text>
          <text x="28" y="158" fontSize="13" fill="#284d35">
            {last ? last.answer.slice(0, 20) : "Equal starting weights"}
          </text>
          {info.sorted.map((h, i) => {
            const y = 12 + i * 55;
            return (
              <g key={h.id}>
                <path
                  d={`M192 143 C280 143 280 ${y + 20} 365 ${y + 20}`}
                  fill="none"
                  stroke={h.id === "guess" ? "#b5a37f" : "#70a886"}
                  strokeWidth={1 + h.weight * 6}
                  opacity={0.3 + h.weight * 0.7}
                />
                <rect
                  x="365"
                  y={y}
                  width="420"
                  height="40"
                  rx="8"
                  fill="#f6faf6"
                  stroke="#d8e5da"
                />
                <text x="380" y={y + 25} fontSize="12" fill="#426b50">
                  {h.name}
                </text>
                <text x="720" y={y + 25} fontSize="12" fill="#426b50">
                  {(h.weight * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
        <div className="hypotheses">
          {info.sorted.map((h) => (
            <div key={h.id} className="hypothesis">
              <div>
                <strong>{h.name}</strong>
                <span>{(h.weight * 100).toFixed(1)}%</span>
              </div>
              <svg viewBox="0 0 400 9" aria-hidden="true">
                <rect width="400" height="9" rx="4" fill="#e8eee9" />
                <rect
                  width={h.weight * 400}
                  height="9"
                  rx="4"
                  fill={h.id === "guess" ? "#b9a276" : "#36876e"}
                />
              </svg>
              <p>
                {h.description}
                {last && h.id !== "guess"
                  ? ` Predicted ${predict(last.task, h.id)} for the last problem.`
                  : ""}
              </p>
            </div>
          ))}
        </div>
        <div className="model-metrics">
          <div>
            <span>Remaining uncertainty</span>
            <strong>{entropy(shown.posterior).toFixed(3)} bits</strong>
          </div>
          <div>
            <span>Next question's expected gain</span>
            <strong>
              {next ? informationGain(next, shown.posterior).toFixed(3) : "—"}{" "}
              bits
            </strong>
          </div>
        </div>
        {next && (
          <p>
            <strong>Selected next:</strong> {next.display}. It maximises
            expected entropy reduction over the remaining generated question
            pool.
          </p>
        )}
        <details>
          <summary>Inspect the model assumptions</summary>
          <p>
            Equal initial weights. Each named strategy assigns 0.9 probability
            to its predicted answer plus 0.1 spread across response buckets.
            “Another approach” is uniform across those buckets. Equivalent
            answers are merged. Updates use Bayes’ rule. This models a short
            session of strategy consistency, not a permanent skill label.
          </p>
        </details>
      </div>
    </details>
  );
}
