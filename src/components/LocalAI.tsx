import { useEffect, useState } from "react";
export function LocalAI() {
  const [status, setStatus] = useState<AIStatus>({
    running: false,
    starting: false,
    message: "Checking local AI…",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (window.untangleAI)
      void window.untangleAI
        .status()
        .then(setStatus)
        .catch((e) => setError(String(e)));
    else
      setStatus({
        running: false,
        starting: false,
        message: "Managed local AI is available in the desktop app.",
      });
  }, []);
  return (
    <section className="settings-page">
      <h1>Optional local AI</h1>
      <p>
        Use a small model to explain retrieved material in natural language.
        Maths checks, follow-up questions and source search work with this
        switched off.
      </p>
      <div className="settings-card">
        <h2>
          {status.running ? "Your model is ready" : "Bring a local model"}
        </h2>
        <ol>
          <li>
            Download a trusted <strong>llama.cpp</strong> build for your
            computer and keep its files together.
          </li>
          <li>
            Download a compatible, appropriately licensed <strong>GGUF</strong>{" "}
            instruction model. A small quantised model is the starting point;
            speed and RAM depend on your hardware.
          </li>
          <li>
            Choose <strong>Start local model</strong>, select{" "}
            <code>llama-server</code> (or <code>llama-server.exe</code>), then
            your GGUF file.
          </li>
        </ol>
        <p>
          The app starts the chosen server in the background on loopback only.
          It sends the current problem, verified answer and up to five retrieved
          passages to that local process. Nothing is sent to a cloud API. Stop
          it here or quit Untangle to stop the process.
        </p>
        <p role="status">{status.message}</p>
        {error && (
          <p role="alert" className="learn-error">
            {error}
          </p>
        )}
        <div className="button-row">
          <button
            className="action-button"
            disabled={!window.untangleAI || status.starting}
            onClick={async () => {
              setError("");
              setStatus({
                running: false,
                starting: true,
                message:
                  "Choose your runtime and model, then wait for loading…",
              });
              try {
                setStatus(await window.untangleAI!.start());
              } catch (e) {
                setError((e as Error).message);
                setStatus({
                  running: false,
                  starting: false,
                  message:
                    "Local AI could not start. Core features remain available.",
                });
              }
            }}
          >
            {status.starting ? "Loading…" : "Start local model"}
          </button>
          <button
            className="quiet-button"
            disabled={
              !window.untangleAI || (!status.running && !status.starting)
            }
            onClick={async () => {
              try {
                setStatus(await window.untangleAI!.stop());
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Stop model
          </button>
        </div>
      </div>
      <p className="fine-print">
        No model weights are included in the installer. The file picker starts
        an executable you select; choose an official runtime you trust. Models
        can make mistakes. Generated prose is labelled and never changes the
        checked answer or diagnostic weights.
      </p>
      <p>
        <a
          href="https://github.com/ggml-org/llama.cpp"
          target="_blank"
          rel="noreferrer"
        >
          Official llama.cpp repository ↗
        </a>
      </p>
    <p><a href="https://huggingface.co/Qwen/Qwen3-0.6B-GGUF" target="_blank" rel="noreferrer">Example tested small model: Qwen3-0.6B-GGUF ↗</a></p></section>
  );
}
