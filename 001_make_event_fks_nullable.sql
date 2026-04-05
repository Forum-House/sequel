-- Migration: Make url_id and user_id nullable in events table
-- Run this once on existing databases to align schema with updated models.py

-- Step 1: Drop existing foreign key constraints
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_url_id_fkey;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_user_id_fkey;

-- Step 2: Alter columns to be nullable
ALTER TABLE events ALTER COLUMN url_id DROP NOT NULL;
ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Re-add foreign keys with ON DELETE SET NULL behavior
ALTER TABLE events
    ADD CONSTRAINT events_url_id_fkey
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE SET NULL;

ALTER TABLE events
    ADD CONSTRAINT events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
