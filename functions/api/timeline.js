export async function onRequestGet({ env }) {
  const raw = await env.BLOG_KV.get('timeline');
  let data = [];
  try { data = raw ? JSON.parse(raw) : []; } catch (e) { data = []; }
  return RESP(data);
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('X-Admin-Token') !== env.ADMIN_TOKEN) {
    return RESP({ error: 'X-Admin-Token 校验失败' }, 401);
  }
  let item;
  try { item = await request.json(); } catch (e) {
    return RESP({ error: '请求体不是合法 JSON' }, 400);
  }
  if (!item.date || !item.text) return RESP({ error: '缺少 date / text 字段' }, 400);
  const raw = await env.BLOG_KV.get('timeline');
  let list = [];
  try { list = raw ? JSON.parse(raw) : []; } catch (e) {}
  list.push(item);
  list.sort((a, b) => (a.date < b.date ? 1 : -1));
  await env.BLOG_KV.put('timeline', JSON.stringify(list, null, 2));
  return RESP({ ok: true, total: list.length });
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
};
function RESP(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  });
}