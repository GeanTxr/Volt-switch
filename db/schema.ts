import { integer, jsonb, pgTable, serial, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const pedidos = pgTable("pedidos", {
    numero: serial().primaryKey(),
    clienteId: text("cliente_id").notNull(),
    chave: uuid().notNull(),
    itens: jsonb().$type<{ id: string; nome: string; quantidade: number; precoCentavos: number }[]>().notNull(),
    totalCentavos: integer("total_centavos").notNull(),
    status: text().notNull().default("Aguardando separação"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow().notNull()
}, tabela => [unique().on(tabela.clienteId, tabela.chave)]);
