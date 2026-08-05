export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight for all requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);

    // 2. Invite API Endpoint
    if (url.pathname === "/api/send-invite" && request.method === "POST") {
      try {
        const { inviterEmail, inviterUid, inviteeEmail } = await request.json();

        if (!inviterEmail || !inviterUid || !inviteeEmail) {
          return new Response(
            JSON.stringify({ error: "Missing required payload fields." }),
            { status: 400, headers: corsHeaders() }
          );
        }

        const signupUrl = `https://opsreveal.preventloss.org/signup.html?invitedBy=${encodeURIComponent(inviterUid)}&email=${encodeURIComponent(inviteeEmail)}`;

        // Send Email via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "OpsReveal <onboarding@resend.dev>", // Change to invites@yourdomain.com once domain is verified in Resend
            to: [inviteeEmail],
            subject: `${inviterEmail} invited you to join OpsReveal`,
            html: `
              <div style="font-family: sans-serif; background: #020617; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #38bdf8; margin-top: 0;">Workspace Invitation</h2>
                <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                  <strong>${inviterEmail}</strong> has invited you to join their operational workspace on <strong>OpsReveal</strong>.
                </p>
                <div style="margin-top: 20px;">
                  <a href="${signupUrl}" style="background: #06b6d4; color: #020617; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 14px;">
                    Accept Invitation & Set Password
                  </a>
                </div>
              </div>
            `,
          }),
        });

        const resData = await emailResponse.json();

        if (!emailResponse.ok) {
          return new Response(
            JSON.stringify({ error: "Resend API error", details: resData }),
            { status: 500, headers: corsHeaders() }
          );
        }

        return new Response(
          JSON.stringify({ success: true, id: resData.id }),
          { status: 200, headers: corsHeaders() }
        );

      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    return new Response("OpsReveal Worker API - Active", { status: 200 });
  }
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
}
