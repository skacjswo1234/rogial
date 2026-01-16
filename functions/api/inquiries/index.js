// Cloudflare Pages Functions - 문의 API
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { name, phone, region, workType, minQuantity, message } = body;

    // 필수 필드 검증
    if (!name || !phone || !region || !workType) {
      return new Response(
        JSON.stringify({ error: '필수 필드가 누락되었습니다.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // D1 데이터베이스에 삽입
    const result = await env['rogial-db'].prepare(
      `INSERT INTO inquiries (name, phone, region, work_type, min_quantity, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
       RETURNING *`
    )
      .bind(name, phone, region, workType, minQuantity || null, message || null)
      .first();

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('문의 제출 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM inquiries';
    let countQuery = 'SELECT COUNT(*) as total FROM inquiries';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // 데이터 조회
    const { results } = await env['rogial-db'].prepare(query)
      .bind(...params)
      .all();

    // 전체 개수 조회
    const countResult = await env['rogial-db'].prepare(countQuery)
      .bind(...(status ? [status] : []))
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          totalPages: Math.ceil((countResult?.total || 0) / limit)
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('문의 목록 조회 오류:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

