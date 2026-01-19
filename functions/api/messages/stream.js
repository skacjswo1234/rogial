// Server-Sent Events (SSE) 스트림 - 실시간 메시지 수신
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const inquiry_id = url.searchParams.get('inquiry_id');
  let last_message_id = parseInt(url.searchParams.get('last_message_id') || '0');

  if (!env || !env['rogial-db']) {
    return new Response(
      JSON.stringify({ error: '데이터베이스가 설정되지 않았습니다.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // SSE 스트림 생성
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // 연결 확인 메시지 전송
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // 마지막 확인 시간
      let lastCheck = Date.now();

      // Polling 간격 (3초)
      const pollInterval = 3000;

      const pollMessages = async () => {
        try {
          let query = 'SELECT * FROM messages WHERE id > ?';
          const params = [last_message_id];

          if (inquiry_id) {
            query += ' AND (inquiry_id = ? OR inquiry_id IS NULL)';
            params.push(inquiry_id);
          }

          query += ' ORDER BY created_at ASC';

          const { results } = await env['rogial-db'].prepare(query)
            .bind(...params)
            .all();

          if (results && results.length > 0) {
            for (const message of results) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'message', data: message })}\n\n`)
              );
              last_message_id = Math.max(last_message_id, message.id);
            }
          }

          // Keep-alive 메시지 (30초마다)
          if (Date.now() - lastCheck > 30000) {
            controller.enqueue(encoder.encode(`: keep-alive\n\n`));
            lastCheck = Date.now();
          }
        } catch (error) {
          console.error('메시지 폴링 오류:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
          );
        }
      };

      // 초기 메시지 조회
      await pollMessages();

      // 주기적으로 메시지 확인
      const interval = setInterval(async () => {
        try {
          await pollMessages();
        } catch (error) {
          console.error('폴링 오류:', error);
          clearInterval(interval);
          controller.close();
        }
      }, pollInterval);

      // 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
