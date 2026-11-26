import { produtos } from "../services/catalogo.mjs";
import { formatarPreco, lerCarrinho, salvarCarrinho } from "../services/services.js";

const area = document.getElementById("itens-carrinho");
const botao = document.getElementById("finalizar-compra");
const estado = document.getElementById("estado-carrinho");
let registrando = false;

function mostrarCarrinho() {
    const carrinho = lerCarrinho();
    let totalCentavos = 0;
    area.innerHTML = carrinho.map(item => {
        const produto = produtos.find(produto => produto.id === item.id);
        const subtotal = Math.round(produto.preco * 100) * item.quantidade;
        totalCentavos += subtotal;
        return `<div class="item-carrinho">
            <a href="../produtos/${produto.pagina}"><img src="/img/produtos/${produto.imagem}" alt="${produto.nome}"></a>
            <div class="dados-item">
                <h3><a href="../produtos/${produto.pagina}">${produto.nome}</a></h3>
                <p>${formatarPreco(produto.preco)} por unidade · Subtotal: ${formatarPreco(subtotal / 100)}</p>
                <label>Quantidade <input type="number" min="1" max="99" value="${item.quantidade}" data-id="${item.id}"></label>
            </div>
            <button class="botao-remover" type="button" data-remover="${item.id}" aria-label="Remover ${produto.nome}">Remover</button>
        </div>`;
    }).join("") || '<p>Seu carrinho está vazio. <a class="link-texto" href="../produtos/produtos.html">Explore o catálogo</a>.</p>';
    document.getElementById("total-carrinho").textContent = `Total: ${formatarPreco(totalCentavos / 100)}`;
    botao.disabled = !carrinho.length || registrando;
    area.querySelectorAll("input, button").forEach(campo => campo.disabled = registrando);
}

area.addEventListener("change", evento => {
    if (registrando || !evento.target.dataset.id) return;
    const carrinho = lerCarrinho();
    const item = carrinho.find(item => item.id === evento.target.dataset.id);
    if (!item) return;
    const quantidade = Math.max(1, Math.min(99, Math.trunc(evento.target.valueAsNumber) || 1));
    if (item.quantidade !== quantidade) {
        item.quantidade = quantidade;
        salvarCarrinho(carrinho);
    }
    mostrarCarrinho();
    area.querySelector(`[data-id="${item.id}"]`)?.focus();
});

area.addEventListener("click", evento => {
    if (registrando || !evento.target.dataset.remover) return;
    salvarCarrinho(lerCarrinho().filter(item => item.id !== evento.target.dataset.remover));
    mostrarCarrinho();
    area.querySelector(".botao-remover, .link-texto")?.focus();
    estado.textContent = "Produto removido.";
});

botao.addEventListener("click", async () => {
    const itens = lerCarrinho();
    if (registrando || !itens.length) return;
    registrando = true;
    mostrarCarrinho();
    estado.textContent = "Registrando pedido…";
    try {
        const { apiLoja, loginUrl } = await import("../ultilitarios/ultilitarios.js");
        const { getUser } = await import("/vendor/identity.js");
        if (!await getUser()) {
            location.href = `${loginUrl}?voltar=carrinho`;
            return;
        }
        const chave = sessionStorage.getItem("voltChavePedido") || crypto.randomUUID();
        sessionStorage.setItem("voltChavePedido", chave);
        const pedido = await apiLoja("pedidos", "POST", { chave, itens });
        salvarCarrinho([]);
        location.href = `../confirmacao/confirmacao.html?pedido=${pedido.numero}`;
    } catch (erro) {
        if (erro.status === 401) {
            location.href = "../autenticacao/autenticacao.html?voltar=carrinho";
            return;
        }
        estado.textContent = erro.status ? erro.message : "Não foi possível registrar o pedido. Tente novamente.";
    } finally {
        registrando = false;
        mostrarCarrinho();
    }
});

mostrarCarrinho();
