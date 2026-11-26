import type { Context } from "@netlify/server";
import { and, desc, eq } from "drizzle-orm";
import { obterBanco } from "../../db/index.ts";
import { pedidos } from "../../db/schema.ts";
import { produtos } from "../../js/services/catalogo.mjs";

export const config = { path: "/api/loja/*" };

const aguardando = "Aguardando separação";
const separado = "Disponível para entrega";
const entregue = "Entregue";
const dadosPedido = {
    numero: pedidos.numero, itens: pedidos.itens, totalCentavos: pedidos.totalCentavos,
    status: pedidos.status, criadoEm: pedidos.criadoEm
};

function responder(dados: unknown, status = 200) {
    return Response.json(dados, { status, headers: { "Cache-Control": "no-store" } });
}

async function identificar(contexto: Context) {
    const sessao = contexto.cookies.get("nf_jwt");
    if (!sessao) return null;
    const url = new URL("/.netlify/identity/user", contexto.site.url || process.env.URL);
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        url.protocol = "https:";
    }
    const resposta = await fetch(url, {
        headers: { Authorization: `Bearer ${sessao}` },
        signal: AbortSignal.timeout(5000),
        redirect: "error"
    });
    if (resposta.status === 401 || resposta.status === 403) return null;
    if (!resposta.ok) throw new Error("Identity indisponível");
    const conta = await resposta.json();
    if (typeof conta.id !== "string" || !conta.id) return null;
    const permissoes = Array.isArray(conta.app_metadata?.roles) ? conta.app_metadata.roles : [];
    return {
        id: conta.id,
        nome: conta.user_metadata?.full_name || "Cliente",
        email: conta.email,
        solicitado: conta.user_metadata?.perfil_solicitado,
        perfis: ["usuario", ...["admin", "loja", "entregador"].filter(perfil => permissoes.includes(perfil))]
    };
}

export default async function loja(requisicao: Request, contexto: Context) {
    const url = new URL(requisicao.url);
    try {
        if (requisicao.method !== "GET" && requisicao.headers.get("origin") !== url.origin) {
            return responder({ erro: "Origem inválida." }, 403);
        }
        const conta = await identificar(contexto);
        if (!conta) return responder({ erro: "Entre na sua conta para continuar." }, 401);

        if (url.pathname === "/api/loja/conta" && requisicao.method === "GET") {
            return responder(conta);
        }

        if (url.pathname !== "/api/loja/pedidos") return responder({ erro: "Página não encontrada." }, 404);
        const perfil = url.searchParams.get("perfil") || "usuario";
        if (!conta.perfis.includes(perfil)) return responder({ erro: "Este perfil não está autorizado." }, 403);

        if (requisicao.method === "GET") {
            let filtro;
            const numero = url.searchParams.get("numero");
            if (numero && (!/^\d{1,10}$/.test(numero) || Number(numero) > 2147483647)) {
                return responder({ erro: "Número de pedido inválido." }, 400);
            }
            if (perfil === "usuario") filtro = and(eq(pedidos.clienteId, conta.id), numero ? eq(pedidos.numero, Number(numero)) : undefined);
            if (perfil === "loja") filtro = eq(pedidos.status, aguardando);
            if (perfil === "entregador") filtro = eq(pedidos.status, separado);
            return responder(await obterBanco().select(dadosPedido).from(pedidos).where(filtro).orderBy(desc(pedidos.numero)).limit(50));
        }

        if (requisicao.method !== "POST" && requisicao.method !== "PATCH") return responder({ erro: "Método inválido." }, 405);
        const corpo = await requisicao.json().catch(() => null);
        if (!corpo || typeof corpo !== "object") return responder({ erro: "Dados inválidos." }, 400);

        if (requisicao.method === "POST" && perfil === "usuario") {
            const { chave, itens } = corpo;
            if (typeof chave !== "string" || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(chave) ||
                !Array.isArray(itens) || itens.length < 1 || itens.length > produtos.length) {
                return responder({ erro: "Carrinho inválido." }, 400);
            }
            const produtosDoPedido: typeof pedidos.$inferSelect.itens = [];
            for (const item of itens) {
                const produto = produtos.find(produto => produto.id === item?.id);
                if (!produto || !Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99 ||
                    produtosDoPedido.some(anterior => anterior.id === produto.id)) {
                    return responder({ erro: "Confira os itens e as quantidades do carrinho." }, 400);
                }
                produtosDoPedido.push({ id: produto.id, nome: produto.nome, quantidade: item.quantidade, precoCentavos: Math.round(produto.preco * 100) });
            }
            const totalCentavos = produtosDoPedido.reduce((total, item) => total + item.precoCentavos * item.quantidade, 0);
            const db = obterBanco();
            const [novo] = await db.insert(pedidos).values({ clienteId: conta.id, chave, itens: produtosDoPedido, totalCentavos })
                .onConflictDoNothing({ target: [pedidos.clienteId, pedidos.chave] }).returning(dadosPedido);
            if (novo) return responder(novo, 201);
            const [existente] = await db.select(dadosPedido).from(pedidos)
                .where(and(eq(pedidos.clienteId, conta.id), eq(pedidos.chave, chave)));
            return responder(existente);
        }

        if (requisicao.method === "PATCH" && (perfil === "loja" || perfil === "entregador")) {
            const numero = corpo.numero;
            if (!Number.isInteger(numero) || numero < 1 || numero > 2147483647) return responder({ erro: "Número inválido." }, 400);
            const atual = perfil === "loja" ? aguardando : separado;
            const proximo = perfil === "loja" ? separado : entregue;
            const [pedido] = await obterBanco().update(pedidos).set({ status: proximo })
                .where(and(eq(pedidos.numero, numero), eq(pedidos.status, atual))).returning(dadosPedido);
            return pedido ? responder(pedido) : responder({ erro: "Este pedido já foi atualizado. Recarregue a página." }, 409);
        }

        return responder({ erro: "Ação não autorizada para este perfil." }, 403);
    } catch {
        return responder({ erro: "Serviço indisponível no momento. Tente novamente." }, 503);
    }
}
