import { useRef, useState } from "react";
import { analyse, type Finding, type Analysis } from "./engine";
import { examples } from "./examples";
import { Graph } from "./Graph";
const storageKey = "untangle.source.v1";
function initialSource() {
  try {
    return (
      localStorage.getItem(storageKey)?.slice(0, 20000) ?? examples[0].text
    );
  } catch {
    return examples[0].text;
  }
}
function initialAnalysis(source: string): Analysis {
  try {
    return analyse(source);
  } catch {
    return analyse("");
  }
}
export function TechnicalWorkbench() {
  const [source, setSource] = useState(initialSource);
  const [analysis, setAnalysis] = useState(() => initialAnalysis(source));
  const [selected, setSelected] = useState<string | null>(null);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
  const [filter, setFilter] = useState("all");
  const [explicitOnly, setExplicitOnly] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const editor = useRef<HTMLTextAreaElement>(null);
  const dirty = source !== analysis.source;
  function run(text = source) {
    try {
      const next = analyse(text);
      setAnalysis(next);
      setSelected(null);
      setActiveFinding(null);
      setError("");
      try {
        localStorage.setItem(storageKey, text);
        setMessage("Analysed · saved on this device");
      } catch {
        setMessage("Analysed · browser storage unavailable");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function inspect(f: Finding) {
    setSelected(f.step);
    setActiveFinding(f);
    editor.current?.focus();
    editor.current?.setSelectionRange(f.start, f.end);
  }
  function chooseStep(id: string) {
    setSelected(id);
    setActiveFinding(analysis.findings.find((f) => f.step === id) ?? null);
  }
  function exportReport() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "untangle-analysis.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Analysis exported");
  }
  const findings = analysis.findings.filter(
    (f) =>
      (!selected || f.step === selected) &&
      (filter === "all" || f.severity === filter),
  );
  const explicitCount = analysis.edges.filter(
    (e) => e.kind === "explicit",
  ).length;
  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M4 8h10c12 0-8 16 4 16h10M4 24h7C23 24 7 8 20 8h8"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          untangle<span className="version">/ 0.1</span>
        </a>
        <div className="header-right">
          <span className="local">
            <i /> Local workspace
          </span>
          <a
            href="https://github.com/purysho/Untangle"
            target="_blank"
            rel="noreferrer"
          >
            Source ↗
          </a>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <h1>Clarity, before execution.</h1>
            <p>Inspect ambiguous language. Trace what depends on what.</p>
          </div>
          <button
            className="secondary"
            onClick={exportReport}
            disabled={dirty || !!error || !analysis.steps.length}
          >
            Export analysis <span>↗</span>
          </button>
        </section>
        <div className="toolbar">
          <div>
            <label htmlFor="example">Procedure</label>
            <select
              id="example"
              defaultValue="0"
              onChange={(e) => {
                const sample = examples[Number(e.target.value)];
                setSource(sample.text);
                run(sample.text);
              }}
            >
              {examples.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="snapshot" role="status">
            {dirty
              ? "Source changed · analyse to update"
              : message || "Ready to inspect"}
          </div>
          <button className="primary" onClick={() => run()}>
            Analyse procedure <span>→</span>
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="workbench">
          <section className="source-panel">
            <div className="panel-heading">
              <h2>
                <span>01</span> Source procedure
              </h2>
              <span className="mono">EDITABLE</span>
            </div>
            <div className="source-title">Technical instructions</div>
            <label className="sr-only" htmlFor="source">
              Procedure source
            </label>
            <textarea
              id="source"
              ref={editor}
              spellCheck={false}
              value={source}
              maxLength={20000}
              onChange={(e) => {
                setSource(e.target.value);
                setError("");
                setMessage("");
              }}
            />
            <div className="editor-footer">
              <span>{source.length.toLocaleString()} / 20,000 characters</span>
              <span>TXT</span>
            </div>
            <div className="source-note">
              <span className="note-icon">i</span>
              <p>
                One numbered step per line.
                <br />
                Use “after step 2” or “before step 4” for explicit dependencies.
              </p>
            </div>
            <div className="method">
              <h3>Evidence, not guesswork.</h3>
              <p>
                Each flag links to source text and an explainable rule.
                Technical intent stays with the author.
              </p>
            </div>
          </section>
          <section className="graph-panel">
            <div className="panel-heading">
              <h2>
                <span>02</span> Procedure map
              </h2>
              <span className="mono">{analysis.steps.length} STEPS</span>
            </div>
            <div className="graph-tools">
              <div className="legend">
                <span>
                  <i className="solid" />
                  Explicit
                </span>
                <span>
                  <i className="dashed" />
                  Order only
                </span>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={explicitOnly}
                  onChange={(e) => setExplicitOnly(e.target.checked)}
                />{" "}
                Explicit only
              </label>
            </div>
            {dirty ? (
              <div className="stale">
                <h3>Analysis needs an update</h3>
                <p>
                  The source has changed. Analyse it to rebuild the graph and
                  findings.
                </p>
                <button className="primary" onClick={() => run()}>
                  Update analysis →
                </button>
              </div>
            ) : analysis.steps.length ? (
              <Graph
                analysis={analysis}
                selected={selected}
                onSelect={chooseStep}
                explicitOnly={explicitOnly}
              />
            ) : (
              <div className="stale">
                <h3>Start with an instruction.</h3>
                <p>Add numbered steps, then analyse your procedure.</p>
              </div>
            )}
            <div className="graph-footer">
              <span>{explicitCount} explicit dependencies</span>
              <span>Click a step to inspect</span>
            </div>
          </section>
          <section className="findings-panel">
            <div className="panel-heading">
              <h2>
                <span>03</span> Review findings
              </h2>
              <span className="count">
                {dirty ? "—" : analysis.findings.length}
              </span>
            </div>
            <div className="filter-row">
              <label className="sr-only" htmlFor="severity">
                Filter severity
              </label>
              <select
                id="severity"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All findings</option>
                <option value="warning">Warnings</option>
                <option value="review">Review suggestions</option>
              </select>
              {selected && (
                <button
                  className="text-button"
                  onClick={() => {
                    setSelected(null);
                    setActiveFinding(null);
                  }}
                >
                  Clear step {selected} ×
                </button>
              )}
            </div>
            <div className="findings-scroll">
              {dirty ? (
                <p className="empty">
                  Update the analysis to inspect findings.
                </p>
              ) : findings.length ? (
                findings.map((f) => (
                  <button
                    key={f.id}
                    className={`finding ${activeFinding?.id === f.id ? "active" : ""}`}
                    onClick={() => inspect(f)}
                  >
                    <div className="finding-meta">
                      <span className={f.severity}>
                        {f.severity === "warning" ? "WARNING" : "REVIEW"}
                      </span>
                      <span>STEP {f.step}</span>
                    </div>
                    <h3>{f.title}</h3>
                    <p className="quote">
                      “{analysis.source.slice(f.start, f.end)}”
                    </p>
                    <span className="rule-label">
                      {f.rule} <span>↗</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="empty">
                  <h3>No findings in this view.</h3>
                  <p>
                    Rule coverage is limited. This does not establish technical
                    correctness or STE compliance.
                  </p>
                </div>
              )}
            </div>
            {activeFinding && !dirty && (
              <div className="inspector">
                <div className="inspector-title">WHY IT WAS FLAGGED</div>
                <p>{activeFinding.explanation}</p>
                <div className="inspector-title">AUTHOR ACTION</div>
                <p>{activeFinding.suggestion}</p>
              </div>
            )}
          </section>
        </div>
        <footer>
          <span>
            <i /> All analysis runs on your device
          </span>
          <span>Heuristic authoring aid · No ASD-STE100 compliance claim</span>
        </footer>
      </main>
    </div>
  );
}
