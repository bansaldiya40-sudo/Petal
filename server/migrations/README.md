// =====================================================================
// PETAL DATABASE MIGRATION POLICY
// =====================================================================
// STRICT RULE: All migrations must be ADDITIVE ONLY.
// 1. Never drop tables.
// 2. Never recreate the database.
// 3. Never run "DELETE" or "reset" in dev scripts.
// 4. Any new schema field must be an ADD COLUMN with safe try/catch or default value.
// 5. User notes, decks, quizzes, and progress are sacred.
// =====================================================================
