export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  // Step 1 — No code yet: redirect user to GitHub to authorize
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      redirect_uri: `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/auth`,
    });
    return res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  }

  // Step 2 — Got code: exchange it for an access token
  try {
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      console.error('Token exchange failed:', tokenData);
      return res.status(401).send(`
        <html><body style="background:#1a1714;color:#f5f0e8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <p style="font-size:1.1rem;margin-bottom:1rem;">Login failed.</p>
            <p style="opacity:0.5;font-size:0.8rem;">${JSON.stringify(tokenData)}</p>
            <a href="/admin/" style="color:#c4965a;font-size:0.8rem;">← Try again</a>
          </div>
        </body></html>
      `);
    }

    // Step 3 — Send token back to the CMS window via postMessage
    const script = `
      <script>
        (function() {
          var token = ${JSON.stringify(token)};
          var provider = 'github';
          var data = JSON.stringify({ token: token, provider: provider });
          var message = 'authorization:github:success:' + data;

          if (window.opener) {
            window.opener.postMessage(message, '*');
            setTimeout(function() { window.close(); }, 500);
          } else {
            // Fallback: no opener (e.g. popup was blocked)
            sessionStorage.setItem('decap-cms-auth', data);
            window.location.replace('/admin/');
          }
        })();
      <\/script>
    `;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Logging in — XNTRIC Admin</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #1a1714;
            display: flex; align-items: center; justify-content: center;
            height: 100vh; font-family: sans-serif; color: #f5f0e8;
          }
          p { letter-spacing: 0.08em; font-size: 0.85rem; opacity: 0.6; }
        </style>
      </head>
      <body>
        <p>Logging you in…</p>
        ${script}
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).send('Server error: ' + err.message);
  }
}
