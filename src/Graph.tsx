import type { Analysis } from "./engine";
export function Graph({
  analysis,
  selected,
  onSelect,
  explicitOnly,
}: {
  analysis: Analysis;
  selected: string | null;
  onSelect: (id: string) => void;
  explicitOnly: boolean;
}) {
  const { steps, edges, findings } = analysis;
  const visible = edges.filter((e) => !explicitOnly || e.kind === "explicit");
  const width = 620;
  const height = Math.max(300, steps.length * 100 + 30);
  const point = (id: string) => ({
    x: steps.findIndex((s) => s.id === id) % 2 === 0 ? 205 : 405,
    y: steps.findIndex((s) => s.id === id) * 100 + 60,
  });
  return (
    <div className="graph-scroll">
      <svg
        className="graph"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Procedure dependency graph. Use the step list below to select a node."
      >
        <defs>
          <pattern
            id="dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="#29343d" />
          </pattern>
          <marker
            id="arrow"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path
              d="M0 0 L8 4 L0 8"
              fill="none"
              stroke="#6ed5bc"
              strokeWidth="1.3"
            />
          </marker>
          <marker
            id="order-arrow"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path
              d="M0 0 L8 4 L0 8"
              fill="none"
              stroke="#657783"
              strokeWidth="1.3"
            />
          </marker>
        </defs>
        <rect width={width} height={height} fill="url(#dots)" />
        {visible.map((edge, i) => {
          const a = point(edge.from),
            b = point(edge.to);
          const backwards = a.y >= b.y;
          const bend = backwards ? 80 : 0;
          return (
            <g key={`${edge.from}-${edge.to}-${edge.kind}`}>
              <path
                d={
                  edge.from === edge.to
                    ? `M${a.x + 90} ${a.y - 14} C${a.x + 160} ${a.y - 70} ${a.x + 170} ${a.y + 55} ${a.x + 90} ${a.y + 14}`
                    : `M${a.x} ${a.y + 25} C${a.x + bend} ${a.y + 65} ${b.x + bend} ${b.y - 65} ${b.x} ${b.y - 28}`
                }
                fill="none"
                stroke={edge.kind === "explicit" ? "#6ed5bc" : "#657783"}
                strokeWidth={edge.kind === "explicit" ? 2 : 1.2}
                strokeDasharray={edge.kind === "order" ? "5 6" : undefined}
                markerEnd={`url(#${edge.kind === "explicit" ? "arrow" : "order-arrow"})`}
                opacity={
                  selected && edge.from !== selected && edge.to !== selected
                    ? 0.22
                    : 0.9
                }
              >
                <title>{`${edge.from} → ${edge.to}: ${edge.reason}`}</title>
              </path>
              {edge.kind === "explicit" && a.y < b.y && (
                <text
                  x={(a.x + b.x) / 2 + 16}
                  y={(a.y + b.y) / 2}
                  fill="#6ed5bc"
                  fontSize="10"
                >
                  EXPLICIT
                </text>
              )}
            </g>
          );
        })}
        {steps.map((step) => {
          const p = point(step.id),
            count = findings.filter((f) => f.step === step.id).length;
          return (
            <g
              key={step.id}
              onClick={() => onSelect(step.id)}
              className="graph-node"
              opacity={selected && selected !== step.id ? 0.6 : 1}
            >
              <rect
                x={p.x - 94}
                y={p.y - 25}
                width="188"
                height="50"
                rx="8"
                fill={selected === step.id ? "#203c38" : "#18232c"}
                stroke={
                  selected === step.id
                    ? "#8be4c9"
                    : count
                      ? "#a97c4b"
                      : "#40545e"
                }
                strokeWidth={selected === step.id ? 2 : 1}
              />
              <text
                x={p.x - 80}
                y={p.y - 5}
                fill="#8be4c9"
                fontSize="10"
                fontWeight="700"
              >
                STEP {step.id}
                {step.conditional ? " · CONDITION" : ""}
              </text>
              <text x={p.x - 80} y={p.y + 12} fill="#dbe5e9" fontSize="11">
                {step.text.length > 25
                  ? step.text.slice(0, 25) + "…"
                  : step.text}
              </text>
              {count > 0 && (
                <circle cx={p.x + 89} cy={p.y - 22} r="5" fill="#f4af73" />
              )}
            </g>
          );
        })}
      </svg>
      <div className="step-list" aria-label="Graph steps">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            aria-pressed={s.id === selected}
          >
            <span>{s.id}</span>
            {s.text}
          </button>
        ))}
      </div>
      <details className="edge-list">
        <summary>Inspect dependency evidence ({visible.length})</summary>
        {visible.map((e, i) => (
          <p key={i}>
            <strong>
              {e.from} → {e.to}
            </strong>{" "}
            · {e.kind === "explicit" ? "Explicit reference" : "Document order"}
            <br />
            {e.reason}
          </p>
        ))}
        {visible.length === 0 && <p>No dependencies in this view.</p>}
      </details>
    </div>
  );
}
