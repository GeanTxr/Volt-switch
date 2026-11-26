const parametros = new URLSearchParams(location.hash.slice(1));
if (parametros.has("confirmation_token") || parametros.has("invite_token")) {
    location.replace(`/views/autenticacao/autenticacao.html${location.hash}`);
}
