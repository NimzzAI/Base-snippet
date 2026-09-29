/**
 * Internal Test Suite
 * Khusus untuk pengujian dan verifikasi fitur utama secara internal.
 * Tidak ditampilkan kepada pengguna biasa di UI.
 */
import { config } from "./config";
import {
  verifyAdminCredentials,
  createSessionToken,
  verifySessionToken,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginAttempts,
  getRateLimitKey,
} from "./auth-server";
import { sanitizeText } from "./security";

export interface TestResult {
  suite: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export function runInternalTests(): {
  allPassed: boolean;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  // 1. Config Integrity Test
  const startConfig = Date.now();
  const hasConfig =
    Boolean(config.name) &&
    Boolean(config.websiteName) &&
    Boolean(config.description) &&
    Boolean(config.admin?.username) &&
    Array.isArray(config.categories) &&
    config.categories.length > 0;

  results.push({
    suite: "Config Integrity",
    passed: hasConfig,
    message: hasConfig
      ? "Central config loaded with valid branding & categories"
      : "Central config missing critical keys",
    durationMs: Date.now() - startConfig,
  });

  // 2. Password Verification Test
  const startAuth = Date.now();
  const validCred = verifyAdminCredentials(config.admin.username, config.admin.defaultPasswordFallback);
  const invalidCred = verifyAdminCredentials(config.admin.username, "wrong_password_xyz");
  const invalidUser = verifyAdminCredentials("non_existent_user", "some_password");
  const authPassed = validCred === true && invalidCred === false && invalidUser === false;

  results.push({
    suite: "Admin Credential Verification",
    passed: authPassed,
    message: authPassed
      ? "Credentials validation & non-leak check passed"
      : "Credential verification logic failure",
    durationMs: Date.now() - startAuth,
  });

  // 3. Session Token Test
  const startToken = Date.now();
  const token = createSessionToken(config.admin.username);
  const session = verifySessionToken(token);
  const tamperedToken = token.slice(0, -4) + "abcd";
  const tamperedSession = verifySessionToken(tamperedToken);
  const tokenPassed = session?.username === config.admin.username && tamperedSession === null;

  results.push({
    suite: "Session Token Signing & Tamper Resistance",
    passed: tokenPassed,
    message: tokenPassed
      ? "HMAC session tokens create & verify correctly without forgery"
      : "Token creation or verification failed",
    durationMs: Date.now() - startToken,
  });

  // 4. Rate Limiter & Lockout Test
  const startRate = Date.now();
  const testKey = getRateLimitKey("127.0.0.99", "test-device-sandbox");
  clearLoginAttempts(testKey);

  let initialCheck = checkLoginRateLimit(testKey);
  let failedOnce = recordFailedLogin(testKey);
  recordFailedLogin(testKey);
  recordFailedLogin(testKey);
  recordFailedLogin(testKey);
  let blockedFifth = recordFailedLogin(testKey);
  let lockedCheck = checkLoginRateLimit(testKey);
  clearLoginAttempts(testKey);
  let afterClear = checkLoginRateLimit(testKey);

  const ratePassed =
    initialCheck.allowed === true &&
    failedOnce.isBlocked === false &&
    blockedFifth.isBlocked === true &&
    lockedCheck.allowed === false &&
    afterClear.allowed === true;

  results.push({
    suite: "Brute-force 5-Attempt Rate Limiter & Lockout",
    passed: ratePassed,
    message: ratePassed
      ? "Rate limiter blocks at 5th attempt and recovers after reset"
      : "Rate limiter failed to block at 5 attempts",
    durationMs: Date.now() - startRate,
  });

  // 5. Sanitizer Test
  const startSan = Date.now();
  const dirty = "<script>alert('xss')</script>Hello";
  const clean = sanitizeText(dirty);
  const sanPassed = !clean.includes("<script>") && !clean.includes("</script>");

  results.push({
    suite: "Input Sanitization",
    passed: sanPassed,
    message: sanPassed
      ? "Sanitizer neutralizes HTML tags"
      : "Sanitizer failed to escape markup",
    durationMs: Date.now() - startSan,
  });

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
