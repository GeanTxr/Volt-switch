import { cp, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const caminho of ["index.html", "css", "img", "js", "views"]) {
    await cp(caminho, `dist/${caminho}`, { recursive: true });
}
await cp("views/erros/erros.html", "dist/404.html");
await build({
    entryPoints: ["node_modules/@netlify/identity/dist/main.js"],
    outfile: "dist/vendor/identity.js",
    bundle: true,
    platform: "browser",
    format: "esm"
});
