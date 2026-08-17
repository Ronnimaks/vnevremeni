// Вход в личный кабинет: второй шаг.
//
// Сюда GitHub возвращает человека после подтверждения. Меняем одноразовый код
// на ключ доступа и передаём его окну кабинета. Ключ живёт только в браузере
// и никуда больше не сохраняется.

// Ответ всплывающему окну. Кабинет ждёт именно такой обмен сообщениями:
// сначала «я авторизуюсь», потом результат — иначе он не поймёт, что вход прошёл.
const reply = (payload) => new Response(
  `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><title>Вход в кабинет</title></head>
<body style="font-family: system-ui, sans-serif; background:#0f0f11; color:#f5f5f5; padding:2rem">
<p>Можно закрыть это окно.</p>
<script>
  (function () {
    var message = ${JSON.stringify(payload)};
    function send(event) {
      window.opener.postMessage(message, event.origin);
      window.removeEventListener('message', send, false);
    }
    if (window.opener) {
      window.addEventListener('message', send, false);
      window.opener.postMessage('authorizing:github', '*');
    }
  })();
</script>
</body>
</html>`,
  {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Метку больше не используем — гасим её сразу.
      'Set-Cookie': 'cms-state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    }
  }
);

const failure = (reason) => reply(`authorization:github:error:${JSON.stringify({ message: reason })}`);

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const saved = (request.headers.get('Cookie') || '').match(/cms-state=([^;]+)/)?.[1];

  if (!code) return failure('GitHub не вернул код подтверждения');
  if (!state || !saved || state !== saved) return failure('Проверка подлинности не прошла, попробуйте войти заново');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`
    })
  });

  if (!response.ok) {
    console.error('github-token-failed', response.status, await response.text());
    return failure('GitHub не ответил, попробуйте ещё раз');
  }

  const data = await response.json();
  if (!data.access_token) {
    console.error('github-token-missing', JSON.stringify(data));
    return failure(data.error_description || 'GitHub не выдал ключ доступа');
  }

  return reply(`authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}`);
}
