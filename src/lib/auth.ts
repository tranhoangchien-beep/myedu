/**
 * Master Admin Authentication Service for MyEdu
 * Secure Salted SHA-256 Hashing Implementation
 */

const SALT = 'myedu_sec_salt_2026';
const EXPECTED_USER_HASH = '67f91c225b6728f58f700b2c98264d64ba2961b74d634124d8b236fb0d35a695';
const EXPECTED_PASS_HASH = 'e8688d479925811fad52a88442647de42b3e2e73f43d2daffd0bbac2c2e3fa91';
const AUTH_STORAGE_KEY = 'myedu_master_session_token_v1';

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminCredentials(username: string, pass: string): Promise<boolean> {
  if (!username || !pass) return false;
  const userHash = await sha256(username.trim());
  const passHash = await sha256(SALT + pass);

  return userHash === EXPECTED_USER_HASH && passHash === EXPECTED_PASS_HASH;
}

export function isAuthenticated(): boolean {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return token === 'authenticated_master_myedu';
  } catch {
    return false;
  }
}

export function setAuthenticatedSession(remember: boolean = true): void {
  try {
    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated_master_myedu');
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'authenticated_master_myedu');
    }
  } catch {}
}

export function clearAuthenticatedSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}
