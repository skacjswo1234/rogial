// Cloudflare Pages Functions - 카카오톡 링크 관리 API
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // 환경 변수 확인
    if (!env || !env['rogial-db']) {
      console.error('DB 환경 변수가 설정되지 않았습니다.');
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 카카오톡 링크 조회
    const link = await env['rogial-db'].prepare(
      `SELECT * FROM links WHERE key = 'kakao' LIMIT 1`
    ).first();

    if (!link) {
      // 기본값 반환
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            key: 'kakao', 
            url: 'http://qr.kakao.com/talk/YdyC00gdQ0tDYCJqW7lHKSF7ffg-',
            description: '카카오톡 채널 링크'
          } 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: link }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('링크 조회 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // 환경 변수 확인
    if (!env || !env['rogial-db']) {
      console.error('DB 환경 변수가 설정되지 않았습니다.');
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { url } = body;

    // 필수 필드 검증
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return new Response(
        JSON.stringify({ error: '링크를 입력해주세요.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // URL 형식 검증 (간단한 검증)
    try {
      new URL(url);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: '올바른 URL 형식이 아닙니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 기존 링크 확인
    const existingLink = await env['rogial-db'].prepare(
      `SELECT * FROM links WHERE key = 'kakao' LIMIT 1`
    ).first();

    let result;
    if (existingLink) {
      // 업데이트
      result = await env['rogial-db'].prepare(
        `UPDATE links SET url = ?, updated_at = datetime('now') WHERE key = 'kakao' RETURNING *`
      )
        .bind(url)
        .first();
    } else {
      // 새로 생성
      result = await env['rogial-db'].prepare(
        `INSERT INTO links (key, url, description, created_at) 
         VALUES ('kakao', ?, '카카오톡 채널 링크', datetime('now')) 
         RETURNING *`
      )
        .bind(url)
        .first();
    }

    if (result && result.id) {
      return new Response(
        JSON.stringify({ success: true, data: result, message: '링크가 성공적으로 저장되었습니다.' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } else {
      throw new Error('링크 저장 실패');
    }
  } catch (error) {
    console.error('링크 저장 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

