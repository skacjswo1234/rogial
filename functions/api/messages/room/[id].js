// 대화방 삭제 API (해당 inquiry_id 또는 session_id의 모든 메시지 삭제)
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  
  try {
    if (!env || !env['rogial-db']) {
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const roomId = params.id; // inquiry_id 또는 session_id

    if (!roomId) {
      return new Response(
        JSON.stringify({ error: '대화방 ID가 필요합니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 해당 inquiry_id/session_id의 모든 메시지 삭제
    const deleteQuery = env['rogial-db'].prepare(
      `DELETE FROM messages WHERE inquiry_id = ?`
    ).bind(String(roomId));

    const result = await deleteQuery.run();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${result.meta.changes || 0}개의 메시지가 삭제되었습니다.`,
        deletedCount: result.meta.changes || 0
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('대화방 삭제 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
