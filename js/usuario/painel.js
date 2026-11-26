import { produtos } from "../services/catalogo.mjs";
import { formatarPreco } from "../services/services.js";
import { apiLoja, caminhos, carregarSessao, loginUrl } from "../ultilitarios/ultilitarios.js";

const perfis = { usuario: "Cliente", loja: "Loja / fornecedor", entregador: "Entregador", admin: "Administrador" };

function texto(elemento, tipo, conteudo) {
    const item = document.createElement(tipo);
    item.textContent = conteudo;
    elemento.append(item);
    return item;
}

export async function iniciarPainel(perfil, vazio, acao) {
    const estado = document.getElementById("estado-painel");
    const perfilArea = document.getElementById("perfil-painel");
    const conteudo = document.getElementById("conteudo-painel");
    const lista = document.getElementById("pedidos-painel");
    const rota = `pedidos?perfil=${perfil}`;
    try {
        if (!await carregarSessao()) return;
        const conta = await apiLoja("conta");
        if (!conta.perfis.includes(perfil)) {
            estado.textContent = "Seu perfil não tem acesso a este painel. A aprovação é feita pela equipe da loja.";
            return;
        }
        texto(perfilArea, "p", `Olá, ${conta.nome}!`);
        if (perfil === "usuario") {
            texto(perfilArea, "p", conta.email);
            if (Object.hasOwn(perfis, conta.solicitado) && !conta.perfis.includes(conta.solicitado)) {
                texto(perfilArea, "p", `Perfil solicitado: ${perfis[conta.solicitado]} · aguardando aprovação.`);
            }
        }
        const atalhos = document.getElementById("atalhos-painel");
        for (const outro of conta.perfis.filter(tipo => tipo !== perfil)) {
            const link = texto(atalhos, "a", perfis[outro]);
            link.href = caminhos[outro];
            link.className = "link-texto";
        }
        if (perfil === "loja") {
            const catalogo = document.getElementById("catalogo-loja");
            for (const produto of produtos) texto(catalogo, "li", `${produto.nome} · ${formatarPreco(produto.preco)}`);
        }
        conteudo.hidden = false;
        await carregarPedidos();
    } catch (erro) {
        if (erro.status === 401) location.replace(loginUrl);
        else estado.textContent = erro.status ? erro.message : "Não foi possível carregar o painel. Tente novamente.";
    }

    async function carregarPedidos() {
        const pedidos = await apiLoja(rota);
        lista.replaceChildren();
        estado.textContent = "";
        if (!pedidos.length) texto(lista, "p", vazio);
        if (perfil === "admin" && pedidos.length) texto(lista, "p", `${pedidos.length} pedido(s) recente(s).`);
        for (const pedido of pedidos) {
            const cartao = texto(lista, "article", "");
            cartao.className = "pedido-painel";
            texto(cartao, "h3", `Pedido #${pedido.numero}`);
            const status = texto(cartao, "span", pedido.status);
            status.className = "status-pedido";
            texto(cartao, "p", `${formatarPreco(pedido.totalCentavos / 100)} · ${new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}`);
            const itens = texto(cartao, "ul", "");
            for (const item of pedido.itens) texto(itens, "li", `${item.quantidade} × ${item.nome}`);
            if (acao) {
                const botao = texto(cartao, "button", acao);
                botao.type = "button";
                botao.addEventListener("click", async () => {
                    botao.disabled = true;
                    estado.textContent = "Atualizando pedido…";
                    try {
                        await apiLoja(rota, "PATCH", { numero: pedido.numero });
                        await carregarPedidos();
                        estado.textContent = `Pedido #${pedido.numero} atualizado.`;
                    } catch (erro) {
                        estado.textContent = erro.message;
                        botao.disabled = false;
                    }
                });
            }
        }
    }
}
