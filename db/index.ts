import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema.ts";

function conectar() {
    return drizzle({ schema });
}

let banco: ReturnType<typeof conectar>;

export function obterBanco() {
    banco ||= conectar();
    return banco;
}
