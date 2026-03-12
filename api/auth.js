// Vercel Serverless Function — GitHub OAuth handler for Decap CMS
export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user`;
    return res.redirect(githubAuthUrl);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) return res.status(401).send('Authentication failed.');

    const html = `<!DOCTYPE html><html><head><title>Logging in...</title></head><body>
      <p style="font-family:sans-serif;text-align:center;margin-top:3rem;color:#1a1714;">Logging you in...</p>
      <script>
        const message = 'authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(token)}, provider: 'github' });
        if (window.opener) { window.opener.postMessage(message, '*'); window.close(); }
        else if (window.parent !== window) { window.parent.postMessage(message, '*'); }
      </script></body></html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Auth error: ' + err.message);
  }
}
