import {
  type Domain,
  type Task,
  strategies,
  allDomains,
  parseTask,
  parseAnswer,
  predict,
  tasksFor,
} from "./domain";
export type Posterior = Record<string, number>;
export interface ResponseEvent {
  task: Task;
  answer: string;
}
export interface Session {
  version: 1;
  domain: Domain;
  events: ResponseEvent[];
  posterior: Posterior;
}
export function prior(domain: Domain): Posterior {
  return Object.fromEntries(
    strategies(domain).map((s) => [s.id, 1 / strategies(domain).length]),
  );
}
export function entropy(p: Posterior) {
  return -Object.values(p).reduce(
    (sum, x) => sum + (x > 0 ? x * Math.log2(x) : 0),
    0,
  );
}
function buckets(task: Task) {
  return [
    ...new Set(
      strategies(task.domain)
        .map((s) => predict(task, s.id))
        .filter((x): x is string => x !== null),
    ),
    "OTHER",
  ];
}
function likelihood(
  task: Task,
  id: string,
  bucket: string,
  outcomes: string[],
) {
  return id === "guess"
    ? 1 / outcomes.length
    : (predict(task, id) === bucket ? 0.9 : 0) + 0.1 / outcomes.length;
}
function posteriorFor(
  task: Task,
  p: Posterior,
  bucket: string,
  outcomes: string[],
) {
  const raw = Object.fromEntries(
    strategies(task.domain).map((s) => [
      s.id,
      p[s.id] * likelihood(task, s.id, bucket, outcomes),
    ]),
  );
  const z = Object.values(raw).reduce((a, b) => a + b, 0);
  if (!Number.isFinite(z) || z <= 0)
    throw new Error("Invalid diagnostic state.");
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v / z]));
}
export function update(task: Task, p: Posterior, answer: string) {
  const parsed = parseAnswer(answer);
  const outcomes = buckets(task);
  return posteriorFor(
    task,
    p,
    outcomes.includes(parsed) ? parsed : "OTHER",
    outcomes,
  );
}
export function informationGain(task: Task, p: Posterior) {
  const outcomes = buckets(task);
  const remaining = outcomes.reduce((sum, r) => {
    const chance = strategies(task.domain).reduce(
      (v, h) => v + p[h.id] * likelihood(task, h.id, r, outcomes),
      0,
    );
    return sum + chance * entropy(posteriorFor(task, p, r, outcomes));
  }, 0);
  return Math.max(0, entropy(p) - remaining);
}
export function nextTask(domain: Domain, p: Posterior, seen: string[]) {
  const used = new Set(seen);
  let best: Task | undefined;
  let gain = -1;
  for (const task of tasksFor(domain)) {
    if (used.has(task.id)) continue;
    const value = informationGain(task, p);
    if (value > gain + 1e-12) {
      best = task;
      gain = value;
    }
  }
  return best;
}
export function makeSession(domain: Domain): Session {
  return { version: 1, domain, events: [], posterior: prior(domain) };
}
export function record(session: Session, task: Task, answer: string): Session {
  if (task.domain !== session.domain)
    throw new Error("The task subject does not match this session.");
  if (session.events.length >= 60)
    throw new Error(
      "This session has reached 60 answers. Start a new session.",
    );
  if (session.events.some((e) => e.task.id === task.id))
    throw new Error(
      "This problem was already explored. Try a follow-up or start a fresh session.",
    );
  parseAnswer(answer);
  return {
    ...session,
    events: [...session.events, { task, answer }],
    posterior: update(task, session.posterior, answer),
  };
}
export function replay(text: string): Session {
  if (text.length > 200000) throw new Error("Session file is too large.");
  const data = JSON.parse(text);
  if (
    data?.version !== 1 ||
    !allDomains.includes(data.domain) ||
    !Array.isArray(data.events) ||
    data.events.length > 60
  )
    throw new Error("Use an Untangle learning-session JSON file.");
  let session = makeSession(data.domain);
  for (const event of data.events) {
    const task = parseTask(data.domain, event?.task?.input);
    session = record(session, task, event.answer);
  }
  return session;
}
export function assessment(session: Session) {
  const sorted = strategies(session.domain)
    .map((h) => ({ ...h, weight: session.posterior[h.id] }))
    .sort((a, b) => b.weight - a.weight);
  const top = sorted[0];
  return {
    sorted,
    top,
    tentative:
      session.events.length < 3 || top.weight < 0.8 || top.id === "guess",
  };
}
