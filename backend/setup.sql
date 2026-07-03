-- Run this in your PostgreSQL database (procuresmart) to create the required tables.

-- Assessments table (if not already created)
CREATE TABLE IF NOT EXISTS assessments (
  id                      SERIAL PRIMARY KEY,
  supplier_density        VARCHAR(50)     NOT NULL,
  allocation_timeline     VARCHAR(100)    NOT NULL,
  material_classification VARCHAR(100)    NOT NULL,
  project_capital_allocation NUMERIC(15,2) NOT NULL,
  pricing_matrix_status   VARCHAR(100)    NOT NULL,
  recommended_model       VARCHAR(200)    NOT NULL,
  allocation_fit_percentage INT           NOT NULL,
  ai_justification        TEXT            NOT NULL,
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Feedback table (new)
CREATE TABLE IF NOT EXISTS feedback (
  id                SERIAL PRIMARY KEY,
  rating            SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments          TEXT         NOT NULL DEFAULT '',
  recommended_model VARCHAR(200) NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
