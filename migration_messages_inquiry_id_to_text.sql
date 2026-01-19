-- messages 테이블의 inquiry_id를 INTEGER에서 TEXT로 변경하는 마이그레이션
-- 기존 테이블이 있는 경우 실행

-- 1. 새 테이블 생성 (TEXT 타입)
CREATE TABLE IF NOT EXISTS messages_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id TEXT, 
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 기존 데이터 복사 (inquiry_id를 문자열로 변환)
INSERT INTO messages_new (id, inquiry_id, sender_type, sender_name, message, is_read, created_at)
SELECT id, 
       CASE 
         WHEN inquiry_id IS NULL THEN NULL 
         ELSE CAST(inquiry_id AS TEXT) 
       END,
       sender_type, 
       sender_name, 
       message, 
       is_read, 
       created_at
FROM messages;

-- 3. 기존 테이블 삭제
DROP TABLE IF EXISTS messages;

-- 4. 새 테이블 이름 변경
ALTER TABLE messages_new RENAME TO messages;

-- 5. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_messages_inquiry_id ON messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read, created_at DESC);
