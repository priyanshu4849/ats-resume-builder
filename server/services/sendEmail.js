async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Resend's shared sandbox sender — works without verifying a custom
      // domain, and can send to any recipient (not just the account owner).
      from: "ATS Resume Builder <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

module.exports = sendEmail;
