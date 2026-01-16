# 로지알 문의 시스템

Cloudflare Pages Functions와 D1 데이터베이스를 사용한 문의 관리 시스템입니다.

## 프로젝트 구조

```
rogial/
├── functions/
│   └── api/
│       └── inquiries/
│           ├── [id].js      # 개별 문의 조회/수정/삭제
│           └── index.js     # 문의 목록 조회 및 제출
├── admin.html                # 관리자 페이지
├── index.html                # 메인 랜딩 페이지
├── main.js                   # 클라이언트 스크립트
├── schema.sql                # D1 데이터베이스 스키마
└── wrangler.toml             # Cloudflare 설정 파일
```

## 설정 방법

### 1. D1 데이터베이스 생성

```bash
# Cloudflare Wrangler CLI 설치 (필요한 경우)
npm install -g wrangler

# D1 데이터베이스 생성
wrangler d1 create rogial-db

# 스키마 적용
wrangler d1 execute rogial-db --file=./schema.sql
```

### 2. Cloudflare Pages에 배포

1. Cloudflare Dashboard에서 Pages 프로젝트 생성
2. GitHub 저장소 연결 또는 직접 배포
3. Settings > Functions > D1 Database bindings에서:
   - Variable name: `DB`
   - D1 Database: 생성한 데이터베이스 선택

### 3. 로컬 개발 (선택사항)

```bash
# 로컬 개발 서버 실행
wrangler pages dev

# 로컬 D1 데이터베이스 사용
wrangler d1 execute DB --local --file=./schema.sql
```

## API 엔드포인트

### 문의 제출
- **POST** `/api/inquiries`
- Body: `{ name, phone, region, workType, minQuantity?, message? }`

### 문의 목록 조회
- **GET** `/api/inquiries?status={status}&page={page}&limit={limit}`
- Query Parameters:
  - `status`: pending, contacted, processing, completed, cancelled (선택)
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)

### 문의 상세 조회
- **GET** `/api/inquiries/{id}`

### 문의 상태 업데이트
- **PUT** `/api/inquiries/{id}`
- Body: `{ status, notes? }`

### 문의 삭제
- **DELETE** `/api/inquiries/{id}`

## 데이터베이스 스키마

### inquiries 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INTEGER | 기본 키 (자동 증가) |
| name | TEXT | 신청자 이름 |
| phone | TEXT | 연락처 |
| region | TEXT | 거주 지역 |
| work_type | TEXT | 작업 종류 |
| min_quantity | INTEGER | 최소 수량 (선택) |
| message | TEXT | 문의 내용 (선택) |
| status | TEXT | 상태 (pending, contacted, processing, completed, cancelled) |
| notes | TEXT | 관리자 메모 (선택) |
| created_at | TEXT | 생성일시 |
| updated_at | TEXT | 수정일시 |

## 관리자 페이지

`/admin.html`에서 문의를 관리할 수 있습니다.

- 전체 문의, 대기 중, 연락 완료, 진행 중, 완료, 취소 상태별 조회
- 문의 상세 보기 및 상태 변경
- 검색 및 필터링
- 통계 대시보드

## 상태 값

- `pending`: 대기 중 (기본값)
- `contacted`: 연락 완료
- `processing`: 진행 중
- `completed`: 완료
- `cancelled`: 취소

