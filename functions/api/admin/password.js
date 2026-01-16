// Cloudflare Pages Functions - 관리자 비밀번호 변경 API
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
    const { currentPassword, newPassword } = body;

    // 필수 필드 검증
    if (!currentPassword || typeof currentPassword !== 'string' || currentPassword.trim() === '') {
      return new Response(
        JSON.stringify({ error: '현재 비밀번호를 입력해주세요.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      return new Response(
        JSON.stringify({ error: '새 비밀번호를 입력해주세요.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 관리자 테이블에서 현재 비밀번호 확인
    const admin = await env['rogial-db'].prepare(
      `SELECT id, password FROM admins LIMIT 1`
    ).first();

    if (!admin) {
      return new Response(
        JSON.stringify({ error: '관리자 계정을 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 현재 비밀번호 확인 (단순 비교)
    if (admin.password !== currentPassword) {
      return new Response(
        JSON.stringify({ error: '현재 비밀번호가 올바르지 않습니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 새 비밀번호로 업데이트 (암호화 없이 저장)
    const updateResult = await env['rogial-db'].prepare(
      `UPDATE admins SET password = ? WHERE id = ?`
    )
      .bind(newPassword, admin.id)
      .run();

    if (updateResult.success) {
      return new Response(
        JSON.stringify({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } else {
      throw new Error('비밀번호 업데이트 실패');
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

