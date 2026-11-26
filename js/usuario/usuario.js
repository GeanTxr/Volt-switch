import { acceptInvite, handleAuthCallback, login, signup } from "/vendor/identity.js";
import { lerCarrinho } from "../services/services.js";
import { redirecionarConta } from "../ultilitarios/ultilitarios.js";

const botaoEntrar = document.getElementById("botao-entrar");
const botaoCadastrar = document.getElementById("botao-cadastrar");
const campoNome = document.getElementById("campo-nome");
const campoTipo = document.getElementById("campo-tipo");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const tipo = document.getElementById("tipo");
const titulo = document.getElementById("titulo-autenticacao");
const enviar = document.getElementById("botao-enviar");
const mensagem = document.getElementById("mensagem-autenticacao");
const formulario = document.getElementById("form-autenticacao");
let modo = "entrar";
let convite;

function alternar(novoModo) {
    modo = novoModo;
    const cadastro = modo === "cadastro";
    const convidado = modo === "convite";
    campoNome.hidden = !cadastro;
    campoTipo.hidden = !cadastro;
    email.parentElement.hidden = convidado;
    nome.required = cadastro;
    email.required = !convidado;
    senha.autocomplete = cadastro || convidado ? "new-password" : "current-password";
    titulo.textContent = cadastro ? "Crie sua conta" : convidado ? "Aceite seu convite" : "Entre na sua conta";
    enviar.textContent = cadastro ? "Criar conta" : convidado ? "Ativar conta" : "Entrar";
    botaoEntrar.classList.toggle("ativa", modo === "entrar");
    botaoCadastrar.classList.toggle("ativa", cadastro);
    botaoEntrar.setAttribute("aria-pressed", String(modo === "entrar"));
    botaoCadastrar.setAttribute("aria-pressed", String(cadastro));
    mensagem.textContent = "";
}

botaoEntrar.addEventListener("click", () => alternar("entrar"));
botaoCadastrar.addEventListener("click", () => alternar("cadastro"));

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (enviar.disabled) return;
    enviar.disabled = botaoEntrar.disabled = botaoCadastrar.disabled = true;
    mensagem.textContent = "Aguarde…";
    try {
        if (modo === "convite") {
            await redirecionarConta(await acceptInvite(convite, senha.value));
        } else if (modo === "cadastro") {
            const usuario = await signup(email.value.trim(), senha.value, { full_name: nome.value.trim(), perfil_solicitado: tipo.value });
            senha.value = "";
            if (usuario.emailVerified) await redirecionarConta(usuario);
            else mensagem.textContent = "Confira seu e-mail para confirmar a conta antes de entrar.";
        } else {
            await redirecionarConta(await login(email.value.trim(), senha.value));
        }
    } catch (erro) {
        mensagem.textContent = erro.status === 429 ? "Muitas tentativas. Aguarde e tente novamente." :
            modo === "entrar" ? "Não foi possível entrar. Confira o e-mail e a senha e confirme seu cadastro." :
            "Não foi possível concluir. Confira os dados ou tente novamente mais tarde.";
    } finally {
        enviar.disabled = botaoEntrar.disabled = botaoCadastrar.disabled = false;
    }
});

alternar(new URLSearchParams(location.search).get("modo") === "cadastro" ? "cadastro" : "entrar");
handleAuthCallback().then(resultado => {
    if (resultado?.type === "invite") {
        convite = resultado.token;
        alternar("convite");
    } else if (resultado?.type === "confirmation") {
        if (lerCarrinho().length) location.replace("/views/carrinho/carrinho.html");
        else return redirecionarConta(resultado.user);
    }
}).catch(() => mensagem.textContent = "O link não está mais válido. Abra o link mais recente do seu e-mail.");
