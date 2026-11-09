// Alerts to the owner. A failed email must never stop or undo a change, so this never throws.

export async function emailOwner(env, subject, body) {
  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL || !env.ALERT_FROM) {
    console.log(`Alert not sent, email is not set up: ${subject}`);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: env.ALERT_FROM,
        to: [env.OWNER_EMAIL],
        subject: `${env.PUBLISH_BRANCH === "practice" ? "[Practice] " : ""}${subject}`,
        text: body,
      }),
    });
    if (!response.ok) console.log(`Alert failed with ${response.status}: ${subject}`);
    return response.ok;
  } catch (e) {
    console.log(`Alert failed: ${subject}: ${e.message}`);
    return false;
  }
}
