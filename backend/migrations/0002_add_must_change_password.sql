-- Migration: 0002_add_must_change_password.sql
-- Logic: Adds must_change_password flag to users table.

ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
