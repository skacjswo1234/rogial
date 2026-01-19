// Cloudflare Pages Functions - 실시간 메시지 API

// 메시지 전송 (POST)
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    if (!env || !env['rogial-db']) {
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { inquiry_id, sender_type, sender_name, message } = body;

    // 필수 필드 검증
    if (!sender_type || !sender_name || !message) {
      return new Response(
        JSON.stringify({ error: '필수 필드가 누락되었습니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // sender_type 검증
    if (sender_type !== 'customer' && sender_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: '올바르지 않은 sender_type입니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 한국 시간대 시간 생성
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
    const koreaTimeString = koreaTime.toISOString().replace('T', ' ').substring(0, 19);

    // 메시지 저장
    const insertQuery = env['rogial-db'].prepare(
      `INSERT INTO messages (inquiry_id, sender_type, sender_name, message, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, ?)
       RETURNING *`
    ).bind(
      inquiry_id || null,
      sender_type,
      sender_name,
      message,
      koreaTimeString
    );

    const result = await insertQuery.first();

    if (!result || !result.id) {
      throw new Error('메시지 저장에 실패했습니다.');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('메시지 전송 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 메시지 조회 (GET)
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const inquiry_id = url.searchParams.get('inquiry_id');
  const sender_type = url.searchParams.get('sender_type');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const since = url.searchParams.get('since'); // 특정 시간 이후 메시지

  try {
    if (!env || !env['rogial-db']) {
      return new Response(
        JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let query = 'SELECT * FROM messages WHERE 1=1';
    const params = [];

    if (inquiry_id) {
      query += ' AND inquiry_id = ?';
      params.push(inquiry_id);
    }

    if (sender_type) {
      query += ' AND sender_type = ?';
      params.push(sender_type);
    }

    if (since) {
      query += ' AND created_at > ?';
      params.push(since);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const { results } = await env['rogial-db'].prepare(query)
      .bind(...params)
      .all();

    // 시간순 정렬 (오래된 것부터)
    results.reverse();

    return new Response(
      JSON.stringify({
        success: true,
        data: results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('메시지 조회 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
