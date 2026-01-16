-- 로지알 문의 시스템 D1 데이터베이스 스키마

-- 문의 테이블
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  work_type TEXT NOT NULL,
  min_quantity INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, contacted, processing, completed, cancelled
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_work_type ON inquiries(work_type);

-- 상태 값 체크 제약조건 (SQLite는 CHECK 제약조건 지원)
-- 참고: SQLite는 ENUM을 직접 지원하지 않으므로 애플리케이션 레벨에서 검증 필요

