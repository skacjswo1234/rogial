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

    const messageId = parseInt(params.id);
    const body = await request.json();
    const { is_read } = body;

    if (isNaN(messageId)) {
      return new Response(
        JSON.stringify({ error: '올바르지 않은 메시지 ID입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (is_read === undefined) {
      return new Response(
        JSON.stringify({ error: 'is_read 필드가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 메시지 읽음 상태 업데이트 (messages 테이블에는 updated_at 컬럼이 없음)
    const updateQuery = env['rogial-db'].prepare(
      `UPDATE messages 
       SET is_read = ?
       WHERE id = ?
       RETURNING *`
    ).bind(is_read ? 1 : 0, messageId);

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
