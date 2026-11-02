// Jalankan dengan server demo: DEMO_MODE=1 SUMOPOD_WEBHOOK_SECRET=whsec_dGVzdHNlY3JldHRlc3RzZWNyZXQ= npm start -- -p 3006
// lalu: node tests/webhook.e2e.js
const crypto = require("crypto");
const B = process.env.BASE || "http://localhost:3006";
const secret = "whsec_dGVzdHNlY3JldHRlc3RzZWNyZXQ=";
const sign = (body, ts = Math.floor(Date.now() / 1000)) => {
  const id = "msg_1";
  const sig = crypto.createHmac("sha256", Buffer.from(secret.replace("whsec_", ""), "base64")).update(`${id}.${ts}.${body}`).digest("base64");
  return { "svix-id": id, "svix-timestamp": String(ts), "svix-signature": "v1," + sig, "content-type": "application/json" };
};
(async () => {
  const answers = { name: "Raka", dob: "2026-02-01", started: "lanjut", texture: "cincang", allergies: ["susu"], concern: "bb", proteins: ["ayam", "telur"], budget: "hemat", cookMode: "harian", tools: [] };
  let r = await fetch(B + "/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers, package: "dasar", bump: false, wa: "081299998888", consent: true }) });
  const c = await r.json();
  console.log("checkout", r.status, c.code, c.amount);
  const post = async (label, body, h) => {
    const res = await fetch(B + "/api/webhook/sumopod", { method: "POST", headers: h, body });
    console.log(label, res.status, await res.text());
  };
  const mk = (amount) => JSON.stringify({ event_type: "payment.completed", data: { order_id: c.code, amount, status: "completed", payment_method: "qris" } });
  await post("bad-sig", mk(59000), { ...sign(mk(59000)), "svix-signature": "v1,AAAA" });
  await post("old-ts", mk(59000), sign(mk(59000), Math.floor(Date.now() / 1000) - 900));
  await post("wrong-amount", mk(1000), sign(mk(1000)));
  let s = await (await fetch(B + "/api/orders/" + c.code)).json();
  console.log("status after mismatch", s.status);
  await post("valid", mk(59000), sign(mk(59000)));
  await post("replay", mk(59000), sign(mk(59000)));
  s = await (await fetch(B + "/api/orders/" + c.code)).json();
  console.log("status", s.status, "token?", !!s.token, s.package);
  const t = JSON.stringify({ event_type: "payment.test", data: {} });
  await post("test-event", t, sign(t));
  r = await fetch(B + "/api/swap", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: s.token, month: 1, day: 2, meal: 0 }) });
  console.log("swap on dasar", r.status, await r.text());
  r = await fetch(B + "/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: { ...answers, dob: "2010-01-01" }, package: "lengkap", wa: "0812", consent: true }) });
  console.log("bad input", r.status, await r.text());
  r = await fetch(B + "/m/" + s.token);
  console.log("menu page", r.status, /Raka/.test(await r.text()));
})();
