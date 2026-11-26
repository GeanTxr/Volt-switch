// Recupera os pedidos que ainda precisam ser entregues.\nfunction pedidosParaEntrega() { return JSON.parse(localStorage.getItem("voltPedidos") || "[]").filter(pedido => pedido.status !== "Entregue"); }\n
import { iniciarPainel } from "../usuario/painel.js";

iniciarPainel("entregador", "Nenhum pedido disponível para entrega.", "Marcar como entregue");
