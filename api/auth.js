export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  // Step 1 — No code yet, redirect to GitHub login
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      allow_signup: 'true'
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  }

  // Step 2 — Got code back from GitHub, exchange for token
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      return res.status(401).send(`
        <html><body>
        <p style="font-family:sans-serif;color:red;text-align:center;margin-top:3rem;">
          Login failed: ${data.error_description || 'No token received'}
        </p>
        </body></html>
      `);
    }

    // Step 3 — Send token back to the CMS using postMessage
    const token = data.access_token;
    const message = JSON.stringify({
      token,
      provider: 'github'
    });

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Logging in to XNTRIC Admin...</title></head>
      <body style="background:#1a1714;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <p style="font-family:'DM Sans',sans-serif;color:#f5f0e8;font-size:0.9rem;letter-spacing:0.1em;">
          Logging you in...
        </p>
        <script>
          (function() {
            // The exact format Decap CMS expects
            var msg = 'authorization:github:success:${token}';

            function send() {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                  'authorization:github:success:' + JSON.stringify({ token: '${token}', provider: 'github' }),
                  window.location.origin
                );
                setTimeout(function() { window.close(); }, 500);
              } else {
                // Fallback — redirect directly to admin
                window.location.href = '/admin/';
              }
            }

            // Try immediately and also after a short delay
            send();
            setTimeout(send, 800);
          })();
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    return res.status(500).send(`
      <html><body>
      <p style="font-family:sans-serif;color:red;text-align:center;margin-top:3rem;">
        Server error: ${err.message}
      </p>
      </body></html>
    `);
  }
}
