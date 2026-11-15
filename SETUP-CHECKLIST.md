# Setup checklist for GitHub, Cloudflare and Resend

Only you do these steps, so keys and passwords never pass through Claude or this project. Do them in order. Tick each off. Paste secrets only into the Cloudflare screens named below, and never into a file or a chat.

Before you start, decide where the domain `corkmusicstation.com` will sit. Its nameservers need to point at Cloudflare for Access and the custom address to work. Moving them affects the current live site and any email on that domain, so this is the one step to do last and with care.

## A. GitHub

- [ ] Create a new **public**, empty repository. Don't add a README.
- [ ] Tell Claude the repository address and ask for the first push. It won't push without being asked. It will push the local `master` branch up as `main`.
- [ ] Settings → Rules → Rulesets → New branch ruleset, targeting `main`, set to Active. Tick **Restrict deletions** and **Block force pushes**. Leave the bypass list empty. Don't require pull requests, or the admin area can't save.
- [ ] Create a `practice` branch from `main`. Add a second ruleset for it with the same two ticks.
- [ ] Your profile → Settings → Developer settings → Fine-grained tokens → Generate. Access: **only this repository**. Permissions: **Contents: read and write** (Metadata read-only is added automatically). Expiry: one year, with a reminder in your calendar. Copy it straight into step C.

## B. Cloudflare Pages

- [ ] Workers & Pages → Create → Pages → Connect to Git → choose the repository.
- [ ] Production branch: `main`.
- [ ] Framework preset: None. Build command: `node tools/check-site.mjs`. Build output directory: `site`. Root directory: leave blank.
- [ ] Settings → Builds → Branch control → Preview branches: **Custom**, include only `practice`.

## C. Cloudflare secrets

In the Pages project, Settings → Variables and Secrets. Add each for **Production** and again for **Preview**. Mark the token as a secret.

| Name | Value |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `yourteam.cloudflareaccess.com` |
| `ACCESS_AUD` | The Application Audience tag from step D (different for Production and Preview) |
| `ALLOWED_EMAILS` | Your Google address and the editor's, separated by a comma |
| `GITHUB_REPO` | `your-name/your-repository` |
| `GITHUB_TOKEN` | The token from step A. **Secret** |
| `UPLOAD_TEST_ENABLED` | `1`, during the measuring test only. Delete it afterwards |

Redeploy after adding these, because they only apply to new builds.

## D. Cloudflare Access (Zero Trust, free plan)

- [ ] Integrations → Identity providers → add **Google**, following Cloudflare's on-screen steps.
- [ ] Access → Applications → Add → Self-hosted. Session duration: **1 month**.
- [ ] Add every one of these public hostnames and paths to the same application:
  - `corkmusicstation.com` with path `admin`
  - `corkmusicstation.com` with path `api/admin`
  - `your-project.pages.dev` with path `admin`
  - `your-project.pages.dev` with path `api/admin`
- [ ] Policy: Allow, Include → Emails → your address and the editor's. Login method: Google only.
- [ ] Copy the Application Audience tag into `ACCESS_AUD` for Production.
- [ ] In the Pages project, Settings → General → Access policy → **Enable** for preview deployments. Confirm in Access that a policy now exists for previews, then limit it to the same two emails. Copy that application's tag into `ACCESS_AUD` for Preview.

**Check before going further:** in a private window, open each of these. Each must ask you to log in, and must not show the page:
- [ ] `https://your-project.pages.dev/admin/upload-test.html`
- [ ] `https://your-project.pages.dev/api/admin/upload-test`
- [ ] `https://practice.your-project.pages.dev/admin/upload-test.html`
- [ ] The same paths on `corkmusicstation.com`, once the domain has moved

Those results are acceptance test R58.

## E. Measuring test (R64)

- [ ] Log in and open `/admin/upload-test.html` on the practice address. Press Start and wait about 3 minutes.
- [ ] Note the figures on the page.
- [ ] Open the Pages project's Functions metrics and note the CPU time and any errors or exceeded limits.
- [ ] Send those to Claude. Then delete `UPLOAD_TEST_ENABLED`.

## F. Resend (needed from Stage 2)

- [ ] Create a free Resend account and verify the domain you'll send from.
- [ ] Create an API key that can only send. Add it as `RESEND_API_KEY`, a **secret**, in step C's screen. Add `OWNER_EMAIL` the same way.

## G. Settings for publishing (Stage 2)

Add these in Settings → Variables and Secrets, then redeploy.

| Name | Type | Production | Preview |
|---|---|---|---|
| `PUBLISH_BRANCH` | Text | `main` | `practice` |
| `RECEIPT_KEY` | Secret | A long random value | A different long random value |

With Resend (section F), also add `ALERT_FROM`, the address alerts are sent from, as Text.

## H. Extra protections worth switching on (from the security test)

- [ ] GitHub → repository Settings → Actions → General → **Disable actions**. Nothing here uses them, and it removes a way for a leaked token to run code.
- [ ] GitHub → Settings → General → untick **Wikis** and **Allow forking** if you do not need them.
- [ ] GitHub → your account → Password and authentication → turn on **two-factor authentication**. Do the same for Cloudflare and for both Google accounts on the allow-list.
- [ ] Cloudflare → Zero Trust → the two Access applications → Cookie settings → set **SameSite** to **Strict** and tick **HTTP Only**.
- [ ] After each merge to `main`, check that `https://cork-music-station.pages.dev/` sends a `content-security-policy` header, and that the radio still plays.

## I. After launch: email records and leftovers (from the second security test)

All in Cloudflare → `corkmusicstation.com` → **DNS → Records**, unless it says otherwise. Nobody uses a mailbox on the domain, so these are safe. Do them in this order.

**1. Remove a record that lets the old host get security certificates for your domain**

| Type | Name | Action |
|---|---|---|
| CNAME | `_acme-challenge` | Delete |

**2. Stop other people sending email that claims to come from your domain**

| Type | Name | Content | Action |
|---|---|---|---|
| TXT | `@` (the one starting `v=spf1 ip4:38.113…`) | `v=spf1 -all` | Edit |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine;` | Add |

Then press **Get Help** in the admin area and check the alert still arrives in your inbox, not in spam. If it does, change `p=quarantine` to `p=reject` a week later. If it stops arriving, change the `_dmarc` record to `v=DMARC1; p=none;` and tell Claude.

**3. Remove the old host's mail leftovers**

| Type | Name | Action |
|---|---|---|
| MX | `@` → `mx.corkmusicstation.com` | Delete |
| A | `mx` (six records) | Delete |
| CNAME | `webmail` | Delete |
| CNAME | `dkim._domainkey` | Delete |

Leave everything Resend added (`resend._domainkey`, `send` and `rsend`), and the two records for the website.

**4. Other switches**
- [ ] **Web Analytics off:** Workers & Pages → cork-music-station → Metrics → Web Analytics → disable. The site's protections block its script anyway, which only fills visitors' browsers with warnings.
- [ ] **DNSSEC:** easiest after the registration moves to Cloudflare, where it is one click under DNS → Settings. Before that it needs a record typed in at Network Solutions.
- [ ] **SSL/TLS → Edge Certificates:** check **Always Use HTTPS** is on and **Minimum TLS Version** is 1.2. Both tested as working that way on 15 November 2026.
- [ ] **GitHub:** delete the merged branch `admin-area-and-new-look`.

## J. If a computer, phone or account is lost or stolen

1. **Sign them out everywhere:** Cloudflare → Zero Trust → Team & Resources → Users → find the person → **Revoke** sessions.
2. **Remove them** from the `Allowed People` policy in both Access applications and from `ALLOWED_EMAILS` (Production and Preview), then retry both deployments.
3. **Change the Google account's password** and check its security page for devices you don't recognise.
4. **Look at the alert emails** for changes you didn't make, and use **Undo** in the admin area. Older changes can be reversed from GitHub's history.
5. **If the GitHub token may have leaked:** GitHub → Settings → Developer settings → Fine-grained tokens → delete it, make a new one the same way (section A), put it in `GITHUB_TOKEN` for Production and Preview, and retry both deployments.
6. **If the Resend key may have leaked:** delete it in Resend, create a new send-only key, and update `RESEND_API_KEY` the same way.
