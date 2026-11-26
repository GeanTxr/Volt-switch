import { getUser, logout } from "/vendor/identity.js";

export const caminhos = {
    usuario: "/views/user/user.html",
    loja: "/views/fornecedor/fornecedor.html",
    entregador: "/views/entregadores/entregadores.html",
    admin: "/views/admin/admin.html"
};
export const loginUrl = "/views/autenticacao/autenticacao.html";

export async function apiLoja(caminho, metodo = "GET", dados) {
    const resposta = await fetch(`/api/loja/${caminho}`, {
        method: metodo,
        headers: dados ? { "Content-Type": "application/json" } : {},
        body: dados ? JSON.stringify(dados) : undefined
    });
    const resultado = await resposta.json().catch(() => null);
    if (!resposta.ok || !resultado) {
        const erro = new Error(resultado?.erro || "Serviço indisponível. Tente novamente.");
        erro.status = resposta.status;
        throw erro;
    }
    return resultado;
}

export async function redirecionarConta(usuario) {
    if (!usuario) return;
    if (new URLSearchParams(location.search).get("voltar") === "carrinho") {
        location.replace("/views/carrinho/carrinho.html");
        return;
    }
    const pedido = usuario.userMetadata?.perfil_solicitado;
    const perfil = usuario.roles.includes(pedido) && Object.hasOwn(caminhos, pedido) ? pedido :
        ["admin", "loja", "entregador"].find(tipo => usuario.roles.includes(tipo));
    location.replace(caminhos[perfil] || caminhos.usuario);
}

export async function carregarSessao() {
    if (!await getUser()) {
        location.replace(loginUrl);
        return false;
    }
    const botao = document.getElementById("sair-conta");
    if (botao) {
        botao.hidden = false;
        botao.addEventListener("click", async () => {
            botao.disabled = true;
            try {
                await logout();
                location.replace(loginUrl);
            } catch {
                document.getElementById("estado-painel").textContent = "Não foi possível sair. Tente novamente.";
                botao.disabled = false;
            }
        });
    }
    return true;
}
