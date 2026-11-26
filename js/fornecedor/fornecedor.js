// Recupera os pedidos que aguardam separação na loja.\nfunction pedidosParaSeparar() { return JSON.parse(localStorage.getItem("voltPedidos") || "[]").filter(pedido => pedido.status === "Aguardando separação"); }\n
import { iniciarPainel } from "../usuario/painel.js";

iniciarPainel("loja", "Nenhum pedido aguardando separação.", "Liberar para entrega");
