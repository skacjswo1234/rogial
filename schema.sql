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
  status TEXT NOT NULL DEFAULT 'pending', 
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

-- 관리자 테이블 (단순 비밀번호 비교용)
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 초기 관리자 비밀번호 설정 (예: 'admin123')
-- INSERT INTO admins (password) VALUES ('admin123');
-- 사용자가 직접 비밀번호를 설정할 수 있도록 주석 처리

-- 링크 관리 테이블
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT
);

-- 기본 카카오톡 링크 설정
-- INSERT INTO links (key, url, description) VALUES ('kakao', 'http://qr.kakao.com/talk/YdyC00gdQ0tDYCJqW7lHKSF7ffg-', '카카오톡 채널 링크');
