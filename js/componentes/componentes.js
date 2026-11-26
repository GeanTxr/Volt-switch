import { produtos } from "../services/catalogo.mjs";
import { formatarPreco } from "../services/services.js";

const campo = document.getElementById("campo-pesquisa");
const categoria = document.getElementById("filtro-categoria");
const ordem = document.getElementById("filtro-ordem");
const resultados = document.getElementById("resultados-produtos");
const limpar = document.getElementById("limpar-filtros");
const topo = document.getElementById("busca-topo");

function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function criarCard(produto) {
    return `<article class="card-produto">
        <a href="${produto.pagina}">
            <img src="/img/produtos/${produto.imagem}" alt="">
            <h3>${produto.nome}</h3>
        </a>
        <div><p class="preco-atual">${formatarPreco(produto.preco)}</p><p class="texto-pix">à vista no PIX</p></div>
        <button type="button" class="btn-comprar" onclick="adicionarCarrinho('${produto.id}')">Adicionar ao carrinho</button>
    </article>`;
}

function pesquisarProdutos() {
    const termos = normalizar(campo.value).split(/\s+/).filter(Boolean);
    const lista = produtos.filter(produto => {
        const nomeCombina = termos.every(termo => normalizar(produto.nome).includes(termo));
        return nomeCombina && (!categoria.value || produto.categoria === categoria.value);
    });

    if (ordem.value === "menor") lista.sort((primeiro, segundo) => primeiro.preco - segundo.preco);
    if (ordem.value === "maior") lista.sort((primeiro, segundo) => segundo.preco - primeiro.preco);
    if (ordem.value === "nome") lista.sort((primeiro, segundo) => primeiro.nome.localeCompare(segundo.nome, "pt-BR"));

    document.getElementById("quantidade-resultados").textContent = lista.length === 1 ? "1 produto encontrado" : `${lista.length} produtos encontrados`;
    resultados.innerHTML = lista.length ? lista.map(criarCard).join("") : '<p class="mensagem-vazia">Nenhum produto encontrado. Tente outro termo ou limpe os filtros.</p>';
    const parametros = new URLSearchParams();
    if (campo.value.trim()) parametros.set("busca", campo.value.trim());
    if (categoria.value) parametros.set("categoria", categoria.value);
    if (ordem.value) parametros.set("ordem", ordem.value);
    history.replaceState(null, "", `${location.pathname}${parametros.size ? `?${parametros}` : ""}`);
    topo.value = campo.value;
    limpar.disabled = !parametros.size;
}

const parametros = new URLSearchParams(location.search);
campo.value = parametros.get("busca") || "";
const chaveCategoria = normalizar(parametros.get("categoria") || "").replace(/\s+/g, "-");
categoria.value = chaveCategoria === "placas-de-video" ? "placas-video" : chaveCategoria;
ordem.value = parametros.get("ordem") || "";
campo.addEventListener("input", pesquisarProdutos);
categoria.addEventListener("change", pesquisarProdutos);
ordem.addEventListener("change", pesquisarProdutos);
limpar.addEventListener("click", () => {
    campo.value = categoria.value = ordem.value = "";
    pesquisarProdutos();
    campo.focus();
});
pesquisarProdutos();
