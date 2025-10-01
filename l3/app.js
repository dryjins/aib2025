/**
 * MVP Logger with user-provided GAS URL.
 * - Stores the Apps Script Web App URL in localStorage.
 * - Sends JSON via fetch POST to the provided endpoint.
 * - Minimal buttons for A/B CTA and a heartbeat event.
 */

const LS_KEY_URL = "gas_url";
const LS_KEY_UID = "uid";

/** Generate or read a stable pseudo user id. */
function getUserId() {
  let uid = localStorage.getItem(LS_KEY_UID);
  if (!uid) {
    uid = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    localStorage.setItem(LS_KEY_UID, uid);
  }
  return uid;
}

/** Read GAS URL from input or storage. */
function getGasUrl() {
  const input = document.getElementById("gasUrl");
  const fromInput = (input?.value || "").trim();
  if (fromInput) return fromInput;

  const fromStore = (localStorage.getItem(LS_KEY_URL) || "").trim();
  if (input && fromStore) input.value = fromStore;
  return fromStore;
}

/** Persist GAS URL from input. */
function saveGasUrl() {
  const url = (document.getElementById("gasUrl")?.value || "").trim();
  const status = document.getElementById("status");
  if (!url) {
    status.textContent = "Please paste your Apps Script Web App URL (ending with /exec) and click Save URL.";
    return;
  }
  try {
    new URL(url);
  } catch {
    status.textContent = "Invalid URL. Check and try again.";
    return;
  }
  localStorage.setItem(LS_KEY_URL, url);
  status.textContent = "Saved Web App URL.";
}

/** Send one JSON log line to GAS doPost. */
async function sendLog(payload) {
  const url = getGasUrl();
  const status = document.getElementById("status");
  if (!url) {
    status.textContent = "Missing Web App URL. Paste it and click Save URL first.";
    return { ok: false, error: "missing_url" };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    status.textContent = data?.ok ? "Logged ✅" : `Logged with warning: ${JSON.stringify(data)}`;
    return data;
  } catch (err) {
    status.textContent = `Log failed: ${String(err)}`;
    return { ok: false, error: String(err) };
  }
}

/** Wire up UI. */
(function init() {
  const status = document.getElementById("status");
  const saved = localStorage.getItem(LS_KEY_URL);
  if (saved) {
    const input = document.getElementById("gasUrl");
    if (input) input.value = saved;
    status.textContent = "Loaded saved Web App URL.";
  }

  document.getElementById("saveUrl")?.addEventListener("click", saveGasUrl);

  const userId = getUserId();
  const baseMeta = { page: location.pathname, ua: navigator.userAgent };

  document.getElementById("ctaA")?.addEventListener("click", () => {
    sendLog({ event: "cta_click", variant: "A", userId, ts: Date.now(), meta: baseMeta });
  });

  document.getElementById("ctaB")?.addEventListener("click", () => {
    sendLog({ event: "cta_click", variant: "B", userId, ts: Date.now(), meta: baseMeta });
  });

  document.getElementById("heartbeat")?.addEventListener("click", () => {
    sendLog({ event: "heartbeat", userId, ts: Date.now(), meta: baseMeta });
  });
})();
