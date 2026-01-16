// Cloudflare Pages Functions - 개별 문의 API
export async function onRequestGet(context) {
  const { params, env } = context;
  const { id } = params;

  try {
    const result = await env['rogial-db'].prepare(
      'SELECT * FROM inquiries WHERE id = ?'
    )
      .bind(id)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: '문의를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('문의 조회 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPut(context) {
  const { params, request, env } = context;
  const { id } = params;

  try {
    const body = await request.json();
    const { status, notes } = body;

    // 상태 업데이트
    if (status) {
      const result = await env['rogial-db'].prepare(
        `UPDATE inquiries 
         SET status = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?
         RETURNING *`
      )
        .bind(status, notes || null, id)
        .first();

      if (!result) {
        return new Response(
          JSON.stringify({ error: '문의를 찾을 수 없습니다.' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: '업데이트할 필드가 없습니다.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('문의 업데이트 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestDelete(context) {
  const { params, env } = context;
  const { id } = params;

  try {
    const result = await env['rogial-db'].prepare(
      'DELETE FROM inquiries WHERE id = ? RETURNING id'
    )
      .bind(id)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: '문의를 찾을 수 없습니다.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: '문의가 삭제되었습니다.' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('문의 삭제 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

