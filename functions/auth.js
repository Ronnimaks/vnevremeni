// Вход в личный кабинет: первый шаг.
//
// Кабинет (Sveltia CMS) открывает этот адрес во всплывающем окне, а мы
// отправляем человека на GitHub — подтвердить, что он имеет право править сайт.
// Второй шаг в callback.js.
//
// Служба входа живёт на самом домене клуба, а не отдельным адресом на
// workers.dev: те у российских провайдеров не открываются, и кабинет не пустил
// бы внутрь вообще.
//
// Секреты (wrangler pages secret put ... --project-name vnevremeni):
//   GITHUB_CLIENT_ID     — из настроек приложения на GitHub
//   GITHUB_CLIENT_SECRET — оттуда же

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  if (url.searchParams.get('provider') !== 'github') {
    return new Response('Такой способ входа не поддерживается.', { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('Вход в кабинет ещё не настроен.', { status: 500 });
  }

  // Случайная метка: на обратном пути проверим, что вернулись именно от нас,
  // а не по чужой ссылке.
  const state = crypto.randomUUID();

  const target = new URL('https://github.com/login/oauth/authorize');
  target.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  target.searchParams.set('redirect_uri', `${url.origin}/callback`);
  target.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  target.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      'Set-Cookie': `cms-state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
    }
  });
}
