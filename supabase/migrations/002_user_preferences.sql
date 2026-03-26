-- Migration 002: user preferences for rest timer settings

CREATE TABLE pomp.user_preferences (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rest_timer_seconds   integer NOT NULL DEFAULT 90 CHECK (rest_timer_seconds >= 0),
  rest_timer_enabled   boolean NOT NULL DEFAULT true,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pomp.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON pomp.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
