import { produtos } from "./catalogo.mjs";

export function lerCarrinho() {
    try {
        const itens = JSON.parse(sessionStorage.getItem("voltCarrinho") || "[]");
        if (!Array.isArray(itens)) return [];
        return itens.filter(item => item && produtos.some(produto => produto.id === item.id) &&
            Number.isInteger(item.quantidade) && item.quantidade >= 1 && item.quantidade <= 99);
    } catch {
        return [];
    }
}

export function salvarCarrinho(itens) {
    sessionStorage.setItem("voltCarrinho", JSON.stringify(itens));
    sessionStorage.removeItem("voltChavePedido");
    atualizarContadorCarrinho();
}

export function atualizarContadorCarrinho() {
    const quantidade = lerCarrinho().reduce((total, item) => total + item.quantidade, 0);
    document.querySelectorAll(".link-carrinho").forEach(link => link.textContent = `Carrinho (${quantidade})`);
}

window.adicionarCarrinho = function (id) {
    const produto = produtos.find(produto => produto.id === id);
    if (!produto) return;
    const carrinho = lerCarrinho();
    const item = carrinho.find(item => item.id === id);
    if (item && item.quantidade >= 99) {
        mostrarAviso("Limite de 99 unidades por produto.");
        return;
    }
    if (item) item.quantidade++;
    else carrinho.push({ id, quantidade: 1 });
    salvarCarrinho(carrinho);
    mostrarAviso("Produto adicionado ao carrinho.");
};

let tempoAviso;
function mostrarAviso(texto) {
    let aviso = document.getElementById("aviso-carrinho");
    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "aviso-carrinho";
        aviso.className = "aviso-carrinho";
        aviso.setAttribute("role", "status");
        document.body.append(aviso);
    }
    aviso.hidden = false;
    aviso.textContent = texto;
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => aviso.hidden = true, 3000);
}

export function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

atualizarContadorCarrinho();
