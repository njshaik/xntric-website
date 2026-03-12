export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  res.setHeader('Access-Control-Allow-Origin', '*');

  // No code yet — send user to GitHub to authorize
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      // No redirect_uri here — GitHub uses the one registered in your OAuth App
    });
    return res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  }

  // Got code back — exchange for access token
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        // No redirect_uri here either
      }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return res.status(401).send(`
        <html><body style="background:#1a1714;color:#f5f0e8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <p>Login failed — no token received. Check OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in Vercel.</p>
        </body></html>
      `);
    }

    // Send token back to Decap CMS via postMessage — this exact format is required
    const content = JSON.stringify({ token, provider: 'github' });
    const message = `authorization:github:success:${content}`;

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>XNTRIC Admin — Signing in</title>
        <style>
          body { background: #1a1714; display: flex; align-items: center;
                 justify-content: center; height: 100vh; margin: 0;
                 font-family: sans-serif; color: #f5f0e8; }
          p { letter-spacing: 0.1em; font-size: 0.85rem; opacity: 0.7; }
        </style>
      </head>
      <body>
        <p>Signing you in to XNTRIC Admin...</p>
        <script>
          (function() {
            var message = ${JSON.stringify(message)};
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(message, '*');
              setTimeout(function() { window.close(); }, 500);
            } else {
              window.location.replace('/admin/');
            }
          })();
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send('Server error: ' + err.message);
  }
}
