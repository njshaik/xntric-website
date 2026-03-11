# XNTRIC Website — Setup Guide
## Get your site live on Netlify in 5 steps

---

## What's in this folder

```
xntric/
├── index.html          ← Homepage ✅
├── works.html          ← Works/portfolio page ✅
├── blog.html           ← Blog listing ✅
├── contact.html        ← Contact page ✅
├── post-wood.html      ← Blog post ✅
├── post-chisels.html   ← Blog post ✅
├── post-earrings.html  ← Blog post ✅
├── netlify.toml        ← Netlify config ✅
├── admin/
│   ├── index.html      ← CMS admin panel ✅
│   └── config.yml      ← CMS settings ✅
└── images/
    └── uploads/        ← CMS will store images here
```

---

## STEP 1 — Create a GitHub account & repository

1. Go to **github.com** → sign up or log in
2. Click the **+** icon (top right) → **New repository**
3. Name it anything (e.g. `xntric-website`)
4. Set it to **Public**
5. Click **Create repository**
6. Upload ALL the files from this folder into the repo
   - Click **Add file → Upload files**
   - Drag everything in, including the `admin/` folder
   - Click **Commit changes**

---

## STEP 2 — Create a Netlify account & connect your repo

1. Go to **netlify.com** → sign up with GitHub (same account)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → select your `xntric-website` repo
4. Leave all build settings as-is (they'll auto-detect from netlify.toml)
5. Click **Deploy site**

✅ Your site is now live at a URL like `https://random-name-123.netlify.app`
   You can rename this in Site Settings → Site name.

---

## STEP 3 — Enable Netlify Identity (for admin login)

This is what lets you log in to the CMS.

1. In your Netlify dashboard → go to your site
2. Click **Site configuration → Identity**
3. Click **Enable Identity**
4. Scroll down to **Registration** → set to **Invite only**
   (so only you can log in)
5. Scroll to **Git Gateway** → click **Enable Git Gateway**

---

## STEP 4 — Invite yourself as admin user

1. Still in Identity → click **Invite users**
2. Enter YOUR email address → Send invite
3. Check your email → click the invite link
4. Set a password

✅ You now have a login for the admin panel.

---

## STEP 5 — Log in to the admin panel

1. Go to: `https://your-site-name.netlify.app/admin/`
2. Log in with your email and password
3. You'll see the Decap CMS dashboard with:
   - **Blog Posts** — write and publish new posts
   - **Works** — add new projects/pieces
   - **Gallery** — upload photos
   - **Site Settings** — update email, phone, socials

Any changes you save in the CMS are automatically saved to your GitHub repo and your site updates within seconds.

---

## Later: Add your own domain

When you're ready to buy a domain (e.g. xntric.in):

1. Buy the domain from a registrar (GoDaddy, Namecheap, or Google Domains)
2. In Netlify → **Domain management → Add a domain**
3. Follow the DNS instructions Netlify gives you
4. Netlify will also give you a **free SSL certificate** (https://)

---

## Broken links — what's fixed

The following were broken in the original files and have been fixed:

| Issue | Fix |
|-------|-----|
| `post-finish.html`, `post-bamboo.html`, `post-year.html` | Shown as "Coming Soon" (files didn't exist) |
| `post-desk.html` links | Replaced with existing posts |
| Email addresses obfuscated by Cloudflare | Restored to `shujauddin@xntric.in` |
| `index.html` was the CMS loader, not the homepage | Created proper homepage |

---

## Need help?

- Decap CMS docs: https://decapcms.org/docs/
- Netlify Identity docs: https://docs.netlify.com/security/secure-access-to-sites/identity/
