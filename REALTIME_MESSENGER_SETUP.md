# 실시간 메신저 구현 가이드

## 📋 준비물 및 구조

### 현재 프로젝트 구조
```
rogial/
├── index.html          # 메인 페이지
├── main.js            # 프론트엔드 JS
├── chatbot.js         # 챗봇 로직
├── functions/         # Cloudflare Pages Functions
│   └── api/
│       ├── messages/  # 실시간 메시지 API (신규)
│       │   ├── index.js      # 메시지 CRUD
│       │   ├── stream.js     # SSE 스트림
│       │   └── [id].js       # 메시지 업데이트
│       └── inquiries/ # 기존 문의 API
├── schema.sql         # D1 데이터베이스 스키마
└── wrangler.toml      # Cloudflare 설정
```

## 🚀 구현 방법

### 1. 데이터베이스 스키마 업데이트

`schema.sql`에 메시지 테이블이 추가되었습니다. D1 데이터베이스에 적용:

```bash
# 로컬 개발 환경
wrangler d1 execute rogial-db --file=./schema.sql

# 또는 Cloudflare Dashboard에서 직접 실행
```

### 2. API 엔드포인트

#### 메시지 전송 (POST)
```
POST /api/messages
Body: {
  "inquiry_id": 1,           // 선택적
  "sender_type": "customer", // "customer" 또는 "admin"
  "sender_name": "홍길동",
  "message": "안녕하세요"
}
```

#### 메시지 조회 (GET)
```
GET /api/messages?inquiry_id=1&limit=50&since=2024-01-01 00:00:00
```

#### 실시간 스트림 (SSE)
```
GET /api/messages/stream?inquiry_id=1&last_message_id=0
```

#### 메시지 읽음 처리 (PATCH)
```
PATCH /api/messages/123
Body: { "is_read": 1 }
```

### 3. 프론트엔드 구현

`chatbot.js`에 실시간 메시지 기능을 추가해야 합니다.

## 🔄 실시간 통신 방식

### Server-Sent Events (SSE)
- **장점**: 구현 간단, HTTP 기반, 자동 재연결
- **단점**: 서버→클라이언트만 가능 (단방향)
- **해결책**: 메시지 전송은 일반 POST API 사용

### 작동 방식
1. 클라이언트가 SSE 스트림 연결
2. 서버가 3초마다 새 메시지 확인
3. 새 메시지가 있으면 즉시 전송
4. 클라이언트가 메시지 수신 및 표시

## 📝 의뢰인(관리자) 응답 처리 프로세스

### 프로세스 흐름
```
1. 고객이 챗봇으로 문의
   ↓
2. 문의가 D1 DB에 저장 (inquiries 테이블)
   ↓
3. 고객이 메시지 전송 (messages 테이블)
   ↓
4. 관리자 대시보드에서 실시간 확인
   ↓
5. 관리자가 응답 작성 및 전송
   ↓
6. 고객에게 실시간 전달 (SSE)
```

### 관리자 대시보드 필요 기능
- 실시간 메시지 목록
- 문의별 메시지 스레드
- 읽지 않은 메시지 알림
- 메시지 전송 폼

## ⚙️ Cloudflare 설정

### 1. D1 데이터베이스 바인딩 확인
`wrangler.toml`에 이미 설정되어 있는지 확인:
```toml
[[d1_databases]]
binding = "rogial-db"
database_name = "rogial-db"
database_id = "7a4a1dac-1f3d-4807-bce5-91e11a6087be"
```

### 2. Pages Functions 배포
- `functions/` 폴더의 파일들이 자동으로 API 엔드포인트가 됩니다
- `/api/messages` → `functions/api/messages/index.js`
- `/api/messages/stream` → `functions/api/messages/stream.js`

## 🔧 다음 단계

1. ✅ 데이터베이스 스키마 업데이트 (완료)
2. ✅ API 엔드포인트 생성 (완료)
3. ⏳ 프론트엔드 SSE 연결 코드 추가
4. ⏳ 관리자 대시보드에 실시간 메시지 기능 추가
5. ⏳ 알림 시스템 (선택사항)

## 💡 참고사항

- **WebSocket이 필요하다면**: Cloudflare Durable Objects 사용 필요 (더 복잡)
- **현재 방식 (SSE)**: 간단하고 Cloudflare Pages에서 바로 사용 가능
- **Polling 대안**: SSE가 안 되면 3-5초 간격 Polling 사용 가능

## 🧪 테스트 방법

```bash
# 1. 메시지 전송 테스트
curl -X POST https://your-domain.pages.dev/api/messages \
  -H "Content-Type: application/json" \
  -d '{"sender_type":"customer","sender_name":"테스트","message":"안녕하세요"}'

# 2. 메시지 조회 테스트
curl https://your-domain.pages.dev/api/messages

# 3. SSE 스트림 테스트 (브라우저에서)
# EventSource API 사용
```
