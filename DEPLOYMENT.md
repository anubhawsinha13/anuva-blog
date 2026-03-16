# Deploying anuva.blog to SiteGround

## One-time Setup

### 1. Create website in SiteGround
1. Log into [SiteGround Site Tools](https://tools.siteground.com)
2. **Websites → New Website → Existing Domain** → enter `anuva.blog`
3. Note the server IP shown

### 2. Create FTP credentials
1. Site Tools → **FTP Accounts → Create FTP Account**
2. Username: `deploy@anuva.blog` (or similar)
3. Note: server hostname, username, password

### 3. Add GitHub Secrets
In this repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `SITEGROUND_FTP_SERVER` | e.g. `sgXXX.siteground.com` |
| `SITEGROUND_FTP_USERNAME` | your FTP username |
| `SITEGROUND_FTP_PASSWORD` | your FTP password |

### 4. Configure DNS
At your domain registrar for `anuva.blog`:
- `@` A record → SiteGround server IP
- `www` A record → same IP
- TTL: 300

### 5. Enable SSL
Site Tools → **Security → SSL Manager → Let's Encrypt** → install for `anuva.blog`

## Deploy
Every push to `main` automatically builds and deploys.

Manual deploy: GitHub → Actions → "Build & Deploy to SiteGround" → Run workflow

## Local Development
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # generates ./out/ static files
```
