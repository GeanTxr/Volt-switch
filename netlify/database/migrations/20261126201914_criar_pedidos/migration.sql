CREATE TABLE "pedidos" (
	"numero" serial PRIMARY KEY,
	"cliente_id" text NOT NULL,
	"chave" uuid NOT NULL,
	"itens" jsonb NOT NULL,
	"total_centavos" integer NOT NULL,
	"status" text DEFAULT 'Aguardando separação' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_cliente_id_chave_unique" UNIQUE("cliente_id","chave")
);
