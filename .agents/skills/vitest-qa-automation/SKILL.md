---
name: vitest-qa-automation
description: Automated unit, integration, and UI testing skill for React/Vite using Vitest and Testing Library based on TestMu AI (LambdaTest) standards. Use when writing tests, validating video parsers, testing storage sync, or verifying player hooks.
---

# Vitest & QA Automation Guide (MyEdu)
*Standards based on TestMu AI (LambdaTest) and Vitest official best practices.*

## 1. Scope of Testing in MyEdu
Automate tests for high-criticality domain logic:
1. **Link Parsing & Dlink Extraction (`teraboxBridge.ts`):** Ensure regex correctly extracts video IDs and paths from single links, folder links, and raw text lists.
2. **Cloud Dispatch Payload Formatter:** Ensure requests sent to Streamtape and Abyss contain valid multipart fields and sanitized titles.
3. **Course Schema & Data Validation:** Ensure course structures maintain chapter IDs, lesson order, and non-empty titles without mutating user state.
4. **Storage & Encryption Hooks:** Test backup JSON serialization, PBKDF2 hashing, and import schema validation.

---

## 2. Writing Unit Tests with Vitest
Example pattern for testing video URL parsing:
```ts
import { describe, it, expect } from 'vitest';
import { parseTeraBoxInput, normalizeAbyssEmbed } from './videoUtils';

describe('Video Link Parser Suite', () => {
  it('should parse single TeraBox video link and extract title', () => {
    const raw = 'https://www.terabox.com/s/1aBcDeFgHiJkLmNoPqRsTuV';
    const result = parseTeraBoxInput(raw);
    expect(result.length).toBe(1);
    expect(result[0].isValid).toBe(true);
  });

  it('should normalize Abyss iframe embed string into clean player URL', () => {
    const iframe = '<iframe src="https://abyssplayer.com/Ld3tfGRGA" allowfullscreen></iframe>';
    const embed = normalizeAbyssEmbed(iframe);
    expect(embed).toBe('https://abyssplayer.com/Ld3tfGRGA');
  });
});
```

---

## 3. QA Pre-Flight Checklist Before Release
Every feature release must pass the **QA 4-Step Verification**:
1. **CRUD Test:** Create $\rightarrow$ Edit $\rightarrow$ Delete course and lesson without UI crash.
2. **Persistence Test (F5):** Refresh browser and verify data remains intact from LocalStorage/Firestore.
3. **Incognito Test:** Open in private window to test initial cold boot and empty-state handling.
4. **Mobile / Touch Test:** Verify video player touch gestures, full-screen orientation, and responsive drawer on viewport `< 768px`.
