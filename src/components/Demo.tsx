import { parseTask, predict } from "../learning/domain";
import {
  makeSession,
  record,
  assessment,
  nextTask,
} from "../learning/inference";
export function Demo() {
  const cases = ["across", "first"].map((strategy) => {
    let s = makeSession("fractions");
    for (const input of ["1/3 + 1/4", "2/5 + 1/3", "3/4 + 1/2"]) {
      const task = parseTask("fractions", input);
      s = record(s, task, predict(task, strategy)!);
    }
    return s;
  });
  return (
    <section className="demo-page">
      <h1>Same score. Different thinking.</h1>
      <p>
        Two simulated learners both score 0/3 on the same questions. Their
        answers provide different evidence about the method they may be using.
      </p>
      <div className="demo-columns">
        {cases.map((s, i) => {
          const a = assessment(s);
          const next = nextTask(
            "fractions",
            s.posterior,
            s.events.map((e) => e.task.id),
          );
          return (
            <article className="settings-card" key={i}>
              <h2>Simulated learner {i + 1}</h2>
              <strong className="demo-score">0 / 3</strong>
              {s.events.map((e, j) => (
                <p key={j}>
                  {e.task.display} → <strong>{e.answer}</strong>
                </p>
              ))}
              <hr />
              <h3>Leading explanation</h3>
              <p>
                {a.top.name} ({(a.top.weight * 100).toFixed(1)}% model weight)
              </p>
              <h3>Best follow-up under this model</h3>
              <p>{next?.display}</p>
              <p className="fine-print">
                The engine chooses the question that best separates the
                remaining possible methods, given this learner’s responses.
              </p>
            </article>
          );
        })}
      </div>
      <p className="fine-print">
        This is a reproducible synthetic demonstration, not evidence that the
        model diagnoses real students with these accuracy levels.
      </p>
    </section>
  );
}
