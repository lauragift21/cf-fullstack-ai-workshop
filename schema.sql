DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS conversations;

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  document_ids TEXT,
  created_at INTEGER NOT NULL
);
