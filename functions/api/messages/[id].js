// 메시지 읽음 처리 (PATCH)
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  
  try {
    if (!env || !env['rogial-db']) {
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messageId = params.id;
    const body = await request.json();
    const { is_read } = body;

    if (is_read === undefined) {
      return new Response(
        JSON.stringify({ error: 'is_read 필드가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 한국 시간대 시간 생성
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
    const koreaTimeString = koreaTime.toISOString().replace('T', ' ').substring(0, 19);

    // 메시지 읽음 상태 업데이트
    const updateQuery = env['rogial-db'].prepare(
      `UPDATE messages 
       SET is_read = ?, updated_at = ?
       WHERE id = ?
       RETURNING *`
    ).bind(is_read ? 1 : 0, koreaTimeString, messageId);

    const result = await updateQuery.first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: '메시지를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('메시지 업데이트 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
