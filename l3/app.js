/**
 * app.js: Sends minimal event logs to Apps Script Web App.
 * Replace GAS_URL with your deployed Web App URL ending with /exec.
 */
const GAS_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOURS/exec";

function sendLog(payload) {
  return fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(r => r.json());
}

function uid() { return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)); }

const userId = localStorage.getItem("uid") || (localStorage.setItem("uid", uid()), localStorage.getItem("uid"));

document.getElementById("ctaA").onclick = async () => {
  const res = await sendLog({ event: "cta_click", variant: "A", userId, ts: Date.now(), meta: { page: location.pathname } });
  document.getElementById("status").textContent = res.ok ? "Logged A" : "Error logging A";
};

document.getElementById("ctaB").onclick = async () => {
  const res = await sendLog({ event: "cta_click", variant: "B", userId, ts: Date.now(), meta: { page: location.pathname } });
  document.getElementById("status").textContent = res.ok ? "Logged B" : "Error logging B";
};
