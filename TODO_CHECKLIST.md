# 실시간 메신저 구현 체크리스트

## ✅ 이미 완료된 작업
- [x] 프론트엔드 챗봇 코드 (chatbot.js)
- [x] API 엔드포인트 생성 (functions/api/messages/)
- [x] 데이터베이스 스키마 작성 (schema.sql)
- [x] 실시간 SSE 연결 코드

## 🔧 해야 할 작업

### 1단계: 데이터베이스 스키마 적용 (필수)

#### 방법 A: Cloudflare Dashboard에서 실행 (추천)
1. Cloudflare Dashboard 접속
2. Workers & Pages → D1 → rogial-db 선택
3. "Execute SQL" 탭 클릭
4. `schema.sql` 파일의 다음 부분만 복사해서 실행:

```sql
-- 실시간 메신저 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER,
  sender_type TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL
);

-- 메시지 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_messages_inquiry_id ON messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read, created_at DESC);
```

#### 방법 B: Wrangler CLI 사용 (로컬 개발)
```bash
# Wrangler 설치 (아직 안 했다면)
npm install -g wrangler

# 로그인
wrangler login

# 스키마 실행
wrangler d1 execute rogial-db --file=./schema.sql
```

---

### 2단계: Cloudflare Pages에 배포

#### GitHub 연동 배포 (자동)
1. GitHub에 코드 푸시
2. Cloudflare Pages에서 자동 배포 확인

#### 수동 배포
1. Cloudflare Dashboard → Workers & Pages → Pages
2. 프로젝트 선택 또는 새로 만들기
3. `functions/` 폴더가 포함되어 있는지 확인
4. 배포

---

### 3단계: D1 데이터베이스 바인딩 확인

1. Cloudflare Dashboard → Workers & Pages → Pages → 프로젝트 선택
2. Settings → Functions 탭
3. D1 Database bindings 확인:
   - Variable name: `rogial-db`
   - Database: `rogial-db`
   - Environment: Production (및 Preview)

---

### 4단계: 관리자 대시보드에 실시간 메시지 기능 추가 (중요!)

현재 `admin.html`에 실시간 메시지 기능을 추가해야 합니다.

**필요한 기능:**
- [ ] 실시간 메시지 목록 표시
- [ ] 고객 메시지 확인
- [ ] 상담원 응답 전송 폼
- [ ] SSE로 새 메시지 실시간 수신
- [ ] 읽지 않은 메시지 알림

---

### 5단계: 테스트

#### 테스트 순서:
1. **고객 챗봇 테스트**
   - 웹사이트에서 챗봇 열기
   - 메시지 전송
   - DB에 저장되는지 확인

2. **API 테스트**
   ```bash
   # 메시지 전송
   curl -X POST https://your-domain.pages.dev/api/messages \
     -H "Content-Type: application/json" \
     -d '{"sender_type":"customer","sender_name":"테스트","message":"안녕하세요"}'
   
   # 메시지 조회
   curl https://your-domain.pages.dev/api/messages
   ```

3. **관리자 대시보드 테스트**
   - 관리자 로그인
   - 고객 메시지 확인
   - 응답 전송
   - 고객 챗봇에서 응답 수신 확인

---

## 📋 우선순위

### 🔴 최우선 (지금 바로)
1. **D1 데이터베이스에 messages 테이블 생성** (1단계)
2. **Cloudflare Pages에 배포** (2단계)
3. **D1 바인딩 확인** (3단계)

### 🟡 중요 (다음)
4. **관리자 대시보드에 실시간 메시지 기능 추가** (4단계)

### 🟢 선택사항
5. 알림 시스템 (이메일/SMS)
6. 읽지 않은 메시지 카운트
7. 메시지 검색 기능

---

## 🆘 문제 해결

### 메시지가 저장되지 않을 때
- D1 바인딩이 제대로 되어 있는지 확인
- Cloudflare Dashboard에서 Functions 로그 확인
- 브라우저 콘솔에서 에러 확인

### SSE 연결이 안 될 때
- 브라우저 콘솔에서 EventSource 에러 확인
- `/api/messages/stream` 엔드포인트가 제대로 배포되었는지 확인

### 관리자 대시보드가 필요할 때
- `admin.html` 파일에 실시간 메시지 기능 추가 필요
- 별도로 요청하시면 구현해드릴 수 있습니다

---

## 📞 다음 단계

1단계~3단계를 완료하시면 기본적인 실시간 메신저가 작동합니다.
4단계(관리자 대시보드)는 별도로 구현이 필요합니다.

**관리자 대시보드 구현이 필요하시면 알려주세요!**
