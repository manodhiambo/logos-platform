-- Migration 019: Auto-verify all existing users (email verification removed)
UPDATE users SET email_verified = true WHERE email_verified = false;
