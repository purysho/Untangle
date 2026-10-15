import { useState } from "react";
import {
  builtins,
  searchKnowledge,
  type Passage,
} from "../knowledge/retrieval";
import { importKnowledge } from "../knowledge/import";
export function Knowledge({
  passages,
  onChange,
  initialQuery = "fractions denominator equal parts",
}: {
  initialQuery?: string;
  passages: Passage[];
  onChange: (p: Passage[]) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const hits = searchKnowledge(query, [...builtins, ...passages]);
  return (
    <section className="library-page">
      <h1>Your knowledge library</h1>
      <p>
        Find useful explanations in the built-in pack and your own documents.
        Search and extraction run on this device.
      </p>
      <div className="library-tools">
        <label className="upload-button">
          {busy ? "Reading document…" : "Add PDF, TXT or Markdown"}
          <input
            aria-label="Import knowledge"
            type="file"
            accept=".pdf,.txt,.md"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setMessage("");
              try {
                const added = await importKnowledge(file);
                const next = [
                  ...passages.filter((p) => p.source !== file.name),
                  ...added,
                ];
                if (JSON.stringify(next).length > 1500000)
                  throw new Error(
                    "Library limit reached. Clear imported sources before adding more.",
                  );
                onChange(next);
                setMessage(`Added ${added.length} passages from ${file.name}.`);
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        <button
          className="quiet-button"
          disabled={!passages.length}
          onClick={() => {
            onChange([]);
            setMessage("Imported sources cleared.");
          }}
        >
          Clear imported sources
        </button>
      </div>
      <p role="status">{message}</p>
      <label className="field-label" htmlFor="knowledge-query">
        Search your sources
      </label>
      <input
        id="knowledge-query"
        className="wide-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="For example: why do denominators stay the same?"
      />
      <div className="search-results">
        {hits.map(({ passage, score }, i) => (
          <article key={passage.id}>
            <span className="source-number">{i + 1}</span>
            <div>
              <h2>{passage.title}</h2>
              <p>{passage.text}</p>
              <small>
                {passage.source}
                {passage.page ? ` · page ${passage.page}` : ""} · lexical
                relevance {score.toFixed(2)}
              </small>
            </div>
          </article>
        ))}
        {!hits.length && (
          <p>
            No matching passages. Try different words or add relevant material.
          </p>
        )}
      </div>
      <p className="fine-print">
        PDFs: up to 20 MB, 100 pages and 200,000 extracted characters. Scanned
        images need OCR first. Imported documents are evidence, never
        instructions to the app. Source text is stored locally without
        encryption.
      </p>
    </section>
  );
}
