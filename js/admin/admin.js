// Funções auxiliares do painel administrativo.\nfunction contarContas() { return JSON.parse(localStorage.getItem("voltUsuarios") || "[]").length; }\n
import { iniciarPainel } from "../usuario/painel.js";

iniciarPainel("admin", "Nenhum pedido foi registrado.");
