CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  tsh NUMERIC(8,2) NOT NULL CHECK (tsh >= 0 AND tsh <= 500),
  t3 NUMERIC(8,2) NOT NULL CHECK (t3 >= 0 AND t3 <= 2000),
  t4 NUMERIC(8,2) NOT NULL CHECK (t4 >= 0 AND t4 <= 100),
  free_t3 NUMERIC(8,2) NOT NULL CHECK (free_t3 >= 0 AND free_t3 <= 50),
  free_t4 NUMERIC(8,2) NOT NULL CHECK (free_t4 >= 0 AND free_t4 <= 20),
  symptoms TEXT[] DEFAULT '{}',
  prediction TEXT NOT NULL CHECK (prediction IN ('Normal', 'Hypothyroidism', 'Hyperthyroidism')),
  confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  shap_values JSONB NOT NULL DEFAULT '[]',
  recommendation TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON assessments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_prediction ON assessments(prediction);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
