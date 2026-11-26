import { apiLoja, carregarSessao } from "../ultilitarios/ultilitarios.js";
import { formatarPreco } from "../services/services.js";

const titulo = document.getElementById("titulo-pedido");
const mensagem = document.getElementById("numero-pedido");

async function mostrarConfirmacao() {
    if (!await carregarSessao()) return;
    const numero = new URLSearchParams(location.search).get("pedido");
    if (!numero || !/^\d{1,10}$/.test(numero)) {
        titulo.textContent = "Nenhum pedido selecionado";
        mensagem.textContent = "Acesse seus pedidos para consultar as compras de demonstração.";
        return;
    }
    try {
        const [pedido] = await apiLoja(`pedidos?numero=${numero}`);
        titulo.textContent = pedido ? "Pedido realizado!" : "Pedido não encontrado";
        mensagem.textContent = pedido ? `Pedido #${pedido.numero} · ${formatarPreco(pedido.totalCentavos / 100)} · ${pedido.status}. Nenhum pagamento foi cobrado.` :
            "Nenhum pedido com esse número foi encontrado na sua conta.";
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

mostrarConfirmacao();
