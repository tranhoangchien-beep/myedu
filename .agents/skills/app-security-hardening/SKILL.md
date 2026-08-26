---
name: app-security-hardening
description: Web application security, iframe sandboxing, cryptographic storage, and API key protection skill based on Trail of Bits standards. Use when reviewing security, sandboxing video embeds, hashing passwords, or securing Firestore rules in MyEdu.
---

# Application Security & Hardening Guide (MyEdu)
*Standards based on Trail of Bits Web Application & Cryptographic Security Guidelines.*

## 1. Iframe Sandboxing & Embed Security
To prevent malicious scripts, unexpected top-level navigation, or clickjacking from 3rd-party video hosts:
- **Strict Sandbox Flag:**
  ```html
  <iframe
    src="https://abyssplayer.com/{VIDEO_ID}"
    className="w-full h-full border-0 rounded-xl"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
  />
  ```
- **Disallowed Tokens:** Never include `allow-top-navigation`, `allow-modals`, or `allow-popups-to-escape-sandbox` unless strictly required.

---

## 2. Cryptographic Best Practices (PBKDF2)
- **Key Derivation:** When encrypting local exports or validating admin locks, use PBKDF2 with minimum **100,000 iterations** and `SHA-256`.
- **Salt Generation:** Always generate cryptographically secure random salts using `crypto.getRandomValues(new Uint8Array(16))` per user/instance.
- **Anti-Brute Force:** Enforce progressive rate-limiting (e.g. 60-second cooldown after 5 failed password attempts).

---

## 3. API Key & Credential Hygiene
- **Storage Isolation:** Store user-entered API keys (Abyss API Key, Streamtape Key, TeraBox Token) in local encrypted browser state or dedicated LocalStorage keys. Never expose secret keys in public bundles or git commits.
- **No Hardcoded Tokens:** All default values in source code must serve only as development placeholders; prioritize loaded settings from user input.

---

## 4. Cloud Firestore & Database Security
- **Strict Rule Verification:** Ensure Firestore rules deny read/write to unauthenticated requests when in private mode.
- **Zero-bot / Noindex:** Maintain `<meta name="robots" content="noindex, nofollow" />` across the application to preserve personal learning privacy.

---

## 5. Security Audit Checklist
- [ ] Sandboxed iframes on all video components.
- [ ] No `eval()` or unvalidated `dangerouslySetInnerHTML`.
- [ ] API tokens sanitized before sending to proxy endpoints.
- [ ] Brute-force rate limiting active on sensitive dialogs.
