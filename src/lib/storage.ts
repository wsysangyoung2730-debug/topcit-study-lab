import { emptyState, isStudyState, type StudyState } from "./study";
const DB = "topcit-study-lab",
  CHECKPOINT = "topcit-study-lab-checkpoint";
interface SavedRecord {
  savedAt: number;
  state: StudyState;
}
let connection: Promise<IDBDatabase> | undefined;
function db() {
  return (connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("records");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}
function saved(value: unknown): SavedRecord | undefined {
  if (isStudyState(value)) return { savedAt: 0, state: value };
  const record = value as SavedRecord;
  return record && Number.isFinite(record.savedAt) && isStudyState(record.state)
    ? record
    : undefined;
}
function checkpoint(): SavedRecord | undefined {
  try {
    return saved(JSON.parse(localStorage.getItem(CHECKPOINT) ?? "null"));
  } catch {
    return undefined;
  }
}
export function stageState(state: StudyState) {
  try {
    localStorage.setItem(
      CHECKPOINT,
      JSON.stringify({ savedAt: Date.now(), state }),
    );
  } catch {
    /* IndexedDB remains the primary store when synchronous storage is unavailable. */
  }
}
export async function readState(): Promise<StudyState> {
  const staged = checkpoint();
  let stored: SavedRecord | undefined;
  try {
    const connection = await db();
    stored = await new Promise((resolve, reject) => {
      const request = connection
        .transaction("records")
        .objectStore("records")
        .get("state");
      request.onsuccess = () => resolve(saved(request.result));
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    if (!staged) throw error;
  }
  return staged && (!stored || staged.savedAt >= stored.savedAt)
    ? staged.state
    : (stored?.state ?? emptyState());
}
export async function writeState(state: StudyState) {
  const record = { savedAt: Date.now(), state };
  const connection = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = connection.transaction("records", "readwrite");
    tx.objectStore("records").put(record, "state");
    tx.oncomplete = () => {
      try {
        const staged = checkpoint();
        if (staged && staged.savedAt <= record.savedAt)
          localStorage.removeItem(CHECKPOINT);
      } catch {}
      resolve();
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export function exportState(state: StudyState) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(state)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `topcit-study-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
