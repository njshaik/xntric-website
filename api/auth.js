export default async function handler(req, res) {
  const { code, provider } = req.query;
  const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  // No code — send user to GitHub
  if (!code) {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
    });
    return res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  }

  // Got code — exchange for token
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
      return res.status(401).send('Login failed — no token received.');
    }

    // Send token back using the EXACT format Decap CMS listens for
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>XNTRIC Admin — Logging in</title>
        <style>
          body { background: #1a1714; display: flex; align-items: center;
                 justify-content: center; height: 100vh; margin: 0;
                 font-family: sans-serif; color: #f5f0e8; }
          p { letter-spacing: 0.1em; font-size: 0.85rem; opacity: 0.7; }
        </style>
      </head>
      <body>
        <p>Logging you in to XNTRIC Admin...</p>
        <script>
          var receiveMessage = function(e) {};
          var data = ${JSON.stringify({ token, provider: 'github' })};
          var str = JSON.stringify(data);

          if (window.opener) {
            window.opener.postMessage(
              'authorization:github:success:' + str,
              '*'
            );
            setTimeout(function(){ window.close(); }, 1000);
          } else {
            // No opener — store token and redirect
            localStorage.setItem('netlify-cms-user', JSON.stringify({
              token: data.token,
              provider: 'github'
            }));
            window.location.replace('/admin/');
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send('Server error: ' + err.message);
  }
}
