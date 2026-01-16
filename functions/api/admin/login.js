// Cloudflare Pages Functions - 관리자 로그인 API
export async function onRequestPost(context) {
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
    const { password } = body;

    // 비밀번호 검증
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return new Response(
        JSON.stringify({ error: '비밀번호를 입력해주세요.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 관리자 테이블에서 비밀번호 조회 (단순 비교)
    const admin = await env['rogial-db'].prepare(
      `SELECT id, password FROM admins LIMIT 1`
    ).first();

    // 관리자가 없으면 첫 번째 관리자 생성 (개발용 - 실제로는 미리 생성 필요)
    if (!admin) {
      console.log('관리자 계정이 없습니다. 새 계정을 생성해야 합니다.');
      return new Response(
        JSON.stringify({ error: '관리자 계정이 설정되지 않았습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 비밀번호 단순 비교 (암호화 없이)
    if (admin.password === password) {
      // 로그인 성공
      return new Response(
        JSON.stringify({ success: true, message: '로그인 성공' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // 비밀번호 불일치
      return new Response(
        JSON.stringify({ error: '비밀번호가 올바르지 않습니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

