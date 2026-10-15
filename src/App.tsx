import { useRef, useState } from "react";
import {
  type Domain,
  parseTask,
  parseAnswer,
  predict,
  examples,
  titles,
  allDomains,
  solution,
  type Task,
} from "./learning/domain";
import {
  makeSession,
  record,
  replay,
  assessment,
  nextTask,
  type Session,
} from "./learning/inference";
import { builtins, searchKnowledge, type Passage } from "./knowledge/retrieval";
import { Problem, FractionVisual, Fraction } from "./components/MathView";
import { Inspector } from "./components/Inspector";
import { Knowledge } from "./components/Knowledge";
import { LocalAI } from "./components/LocalAI";
import { Topics } from "./components/Topics";
import { Demo } from "./components/Demo";
import { TechnicalWorkbench } from "./TechnicalWorkbench";
import "./learning.css";
const sessionKey = "untangle.learning.v1",
  libraryKey = "untangle.library.v1";
function restore() {
  try {
    const raw = localStorage.getItem(sessionKey);
    return raw ? replay(raw) : makeSession("fractions");
  } catch {
    return makeSession("fractions");
  }
}
function restoreLibrary(): Passage[] {
  try {
    const raw = localStorage.getItem(libraryKey);
    if (!raw || raw.length > 1500000) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data)
      ? data
          .filter(
            (p) =>
              typeof p.id === "string" &&
              typeof p.text === "string" &&
              p.text.length <= 1000 &&
              typeof p.source === "string" &&
              typeof p.title === "string",
          )
          .slice(0, 1500)
      : [];
  } catch {
    return [];
  }
}
function saveFile(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function App() {
  const [session, setSession] = useState(restore);
  const [domain, setDomain] = useState<Domain>(session.domain);
  const [input, setInput] = useState(
    session.events.length
      ? (nextTask(
          session.domain,
          session.posterior,
          session.events.map((e) => e.task.id),
        )?.input ?? examples[session.domain])
      : examples[session.domain],
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{
    task: Task;
    answer: string;
    correct: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("learn");
  const [libraryQuery, setLibraryQuery] = useState(
    "fractions denominator equal parts",
  );
  const [passages, setPassages] = useState(restoreLibrary);
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const requestId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  let task: Task | null = null;
  try {
    task = parseTask(domain, input);
  } catch {}
  const info = assessment(session);
  const suggested = nextTask(
    domain,
    session.posterior,
    session.events.map((e) => e.task.id),
  );
  const query =
    domain === "fractions"
      ? "adding fractions denominator equal parts"
      : domain === "algebra"
        ? "linear equation inverse operations coefficient"
        : domain === "coding"
          ? "Python range stop sum accumulation"
          : titles[domain];
  const hits = searchKnowledge(query, [...builtins, ...passages]);
  function persist(next: Session) {
    setSession(next);
    try {
      localStorage.setItem(sessionKey, JSON.stringify(next));
      localStorage.setItem(
        `${sessionKey}:${next.domain}`,
        JSON.stringify(next),
      );
      setStatus("Progress saved on this device.");
    } catch {
      setStatus("Browser storage unavailable. Export your session to keep it.");
    }
  }
  function resetFeedback() {
    requestId.current++;
    setAiText("");
    setAiBusy(false);
    setResult(null);
    setError("");
  }
  function subject(next: Domain) {
    let restored = makeSession(next);
    try {
      const raw = localStorage.getItem(`${sessionKey}:${next}`);
      if (raw) {
        const parsed = replay(raw);
        if (parsed.domain === next) restored = parsed;
      }
    } catch {}
    setDomain(next);
    persist(restored);
    setInput(
      restored.events.length
        ? (nextTask(
            next,
            restored.posterior,
            restored.events.map((e) => e.task.id),
          )?.input ?? examples[next])
        : examples[next],
    );
    setAnswer("");
    resetFeedback();
    setView("learn");
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const t = parseTask(domain, input);
      parseAnswer(answer);
      const next = record(session, t, answer);
      persist(next);
      setResult({
        task: t,
        answer,
        correct: parseAnswer(answer) === predict(t, "correct"),
      });
      setError("");
      setAiText("");
      requestId.current++;
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (view === "writing")
    return (
      <>
        <div className="legacy-return">
          <button onClick={() => setView("learn")}>← Back to learning</button>
        </div>
        <TechnicalWorkbench />
      </>
    );
  return (
    <div className="learn-app">
      <header className="learn-header">
        <button
          className="learn-brand"
          onClick={() => setView("learn")}
          aria-label="Untangle home"
        >
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <path
              d="M8 5v20c0 13 18 13 18 0V5M15 5v20c0 7 18 7 18 0V5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
          untangle
        </button>
        <nav aria-label="Main navigation">
          {[
            ["learn", "Learn"],
            ["topics", "Maths topics"],
            ["library", "Knowledge library"],
            ["ai", "Local AI"],
            ["demo", "See the engine"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={view === key ? "selected" : ""}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <span className="offline-label">
          <i /> Works offline
        </span>
      </header>
      <main className="learn-main">
        {view === "topics" ? (
          <Topics
            choose={subject}
            search={(q) => {
              setLibraryQuery(q);
              setView("library");
            }}
          />
        ) : view === "library" ? (
          <Knowledge
            key={libraryQuery}
            initialQuery={libraryQuery}
            passages={passages}
            onChange={(next) => {
              try {
                localStorage.setItem(libraryKey, JSON.stringify(next));
                setPassages(next);
              } catch {
                throw new Error(
                  "Not enough local storage. Remove an imported document first.",
                );
              }
            }}
          />
        ) : view === "ai" ? (
          <LocalAI />
        ) : view === "demo" ? (
          <Demo />
        ) : (
          <>
            <section className="learn-intro">
              <h1>Let’s untangle it.</h1>
              <p>
                A wrong answer is a clue. Let’s find the thinking behind it.
              </p>
            </section>
            <div className="subject-tabs">
              <label htmlFor="maths-topic">
                Maths topic{" "}
                <select
                  id="maths-topic"
                  value={domain === "coding" ? "fractions" : domain}
                  onChange={(e) => subject(e.target.value as Domain)}
                >
                  {allDomains
                    .filter((d) => d !== "coding")
                    .map((d) => (
                      <option key={d} value={d}>
                        {titles[d]}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className={domain === "coding" ? "active" : ""}
                onClick={() => subject("coding")}
              >
                Code tracing
              </button>
              <button onClick={() => setView("topics")}>
                Explore the maths map ↗
              </button>
            </div>
            <div className="learning-layout">
              <section className="question-card">
                <div className="question-top">
                  <span>{titles[domain]}</span>
                  <span>{session.events.length} answers explored</span>
                </div>
                <label className="field-label" htmlFor="problem">
                  Your problem
                </label>
                <input
                  id="problem"
                  className="problem-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setAnswer("");
                    resetFeedback();
                  }}
                  maxLength={160}
                />
                <p className="input-help">
                  {domain === "fractions"
                    ? "Add two fractions. Use a/b + c/d, including Unicode fractions such as ¾."
                    : domain === "algebra"
                      ? "Solve a linear equation in the form ax + b = c."
                      : domain === "coding"
                        ? "Predict this Python-style expression. We trace supported range sums; submitted code is never executed."
                        : `Supported form: ${examples[domain]}. Enter a problem in this form to explore your method.`}
                </p>
                {task && <Problem task={task} />}
                <form onSubmit={submit}>
                  <label className="field-label" htmlFor="learner-answer">
                    What answer did you get?
                  </label>
                  <div className="answer-row">
                    <input
                      id="learner-answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={
                        domain === "fractions"
                          ? "For example, 4/6"
                          : "Enter a number or fraction"
                      }
                      maxLength={80}
                      autoComplete="off"
                    />
                    <button
                      className="action-button"
                      type="submit"
                      disabled={!answer.trim()}
                    >
                      Explore my answer <span>→</span>
                    </button>
                  </div>
                </form>
                {error && (
                  <p role="alert" className="learn-error">
                    {error}
                  </p>
                )}
                {result && (
                  <section className="answer-feedback" aria-live="polite">
                    <h2>
                      {result.correct
                        ? "That answer checks out."
                        : "Let’s look at your method."}
                    </h2>
                    <p>
                      Your answer: <strong>{result.answer}</strong>.{" "}
                      {result.correct
                        ? "Another question can help us check the method behind it."
                        : "Several methods or a slip could explain this. One answer is not enough to decide."}
                    </p>
                    <p>
                      {info.tentative
                        ? "We’re still gathering clues."
                        : info.top.id === "correct"
                          ? "Your recent answers fit a consistent method."
                          : `Your recent answers most closely fit “${info.top.name.toLowerCase()}” in this model. Let’s check with another question.`}
                    </p>
                    {suggested && (
                      <button
                        className="action-button"
                        onClick={() => {
                          setInput(suggested.input);
                          setAnswer("");
                          resetFeedback();
                        }}
                      >
                        Try a useful follow-up →
                      </button>
                    )}
                    <details className="worked-solution">
                      <summary>See the checked explanation</summary>
                      <p className="verified-answer">
                        Checked answer:{" "}
                        <Fraction value={predict(result.task, "correct")!} />
                      </p>
                      <FractionVisual task={result.task} />
                      <ol>
                        {solution(result.task).map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ol>
                    </details>
                    <details className="retrieved-evidence">
                      <summary>
                        Read supporting material ({hits.length} sources)
                      </summary>
                      {hits.map(({ passage }, i) => (
                        <article key={passage.id}>
                          <h3>
                            [{i + 1}] {passage.title}
                          </h3>
                          <p>{passage.text}</p>
                          <small>
                            {passage.source}
                            {passage.page ? ` · page ${passage.page}` : ""}
                          </small>
                        </article>
                      ))}
                      <button
                        className="quiet-button"
                        disabled={aiBusy}
                        onClick={async () => {
                          if (!window.untangleAI) {
                            setAiText(
                              "Open the desktop app and start a local model in Local AI settings. The checked explanation above works without AI.",
                            );
                            return;
                          }
                          const id = ++requestId.current;
                          setAiBusy(true);
                          setAiText("");
                          try {
                            const text = await window.untangleAI.explain({
                              problem: result.task.display,
                              answer: result.answer,
                              verified: predict(result.task, "correct")!,
                              evidence: hits.map((h) => ({
                                source: h.passage.source,
                                text: h.passage.text,
                              })),
                            });
                            if (requestId.current === id) setAiText(text);
                          } catch (e) {
                            if (requestId.current === id)
                              setAiText((e as Error).message);
                          } finally {
                            if (requestId.current === id) setAiBusy(false);
                          }
                        }}
                      >
                        {aiBusy
                          ? "Local model is explaining…"
                          : "Explain with my local model"}
                      </button>
                      {aiText && (
                        <div className="ai-output">
                          <strong>
                            Local-model output · may contain mistakes
                          </strong>
                          <p>{aiText}</p>
                        </div>
                      )}
                    </details>
                  </section>
                )}
                <p className="save-status" role="status">
                  {status}
                </p>
              </section>
              <aside className="learning-aside">
                <h2>Understanding, one clue at a time.</h2>
                <ol>
                  <li>
                    <span>1</span>Try a problem your way.
                  </li>
                  <li>
                    <span>2</span>Explore a carefully chosen follow-up.
                  </li>
                  <li>
                    <span>3</span>See the explanation that helps.
                  </li>
                </ol>
                <div className="session-actions">
                  <h3>Your session</h3>
                  <button
                    onClick={() =>
                      saveFile("Untangle-learning-session.json", session)
                    }
                    disabled={!session.events.length}
                  >
                    Export session ↗
                  </button>
                  <button onClick={() => fileInput.current?.click()}>
                    Open a saved session
                  </button>
                  <button
                    onClick={() => {
                      persist(makeSession(domain));
                      setInput(examples[domain]);
                      setAnswer("");
                      resetFeedback();
                    }}
                  >
                    Start a fresh session
                  </button>
                  <input
                    ref={fileInput}
                    aria-label="Import learning session"
                    type="file"
                    accept=".json"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        if (f.size > 200000)
                          throw new Error("Session file is too large.");
                        const next = replay(await f.text());
                        setDomain(next.domain);
                        persist(next);
                        setInput(
                          nextTask(
                            next.domain,
                            next.posterior,
                            next.events.map((e) => e.task.id),
                          )?.input ?? examples[next.domain],
                        );
                        setAnswer("");
                        resetFeedback();
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        if (fileInput.current) fileInput.current.value = "";
                      }
                    }}
                  />
                </div>
                <p className="aside-note">
                  No account. No cloud required. You can inspect every
                  diagnostic assumption below.
                </p>
              </aside>
            </div>
            <Inspector session={session} />
            {session.events.length > 0 && (
              <details className="history">
                <summary>Your answer trail ({session.events.length})</summary>
                {session.events.map((e, i) => (
                  <p key={i}>
                    <span>{i + 1}.</span> {e.task.display} →{" "}
                    <strong>{e.answer}</strong>
                  </p>
                ))}
              </details>
            )}
          </>
        )}
        <footer className="learn-footer">
          <span>Built to explore understanding.</span>
          <button onClick={() => setView("writing")}>
            Technical writing tool
          </button>
          <span>Model weights are provisional, not a learner diagnosis.</span>
        </footer>
      </main>
    </div>
  );
}
