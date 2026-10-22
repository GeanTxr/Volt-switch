// Controla a troca entre os formulários de entrar e criar conta.
const botaoEntrar = document.getElementById("botao-entrar");
const botaoCadastrar = document.getElementById("botao-cadastrar");
const campoNome = document.getElementById("campo-nome");
const titulo = document.getElementById("titulo-autenticacao");
const botaoEnviar = document.getElementById("botao-enviar");
const formulario = document.getElementById("form-autenticacao");
const mensagem = document.getElementById("mensagem-autenticacao");
const campoSenha = document.getElementById("senha");

let modoCadastro = false;

function mostrarFormulario(cadastrar) {
    modoCadastro = cadastrar;
    campoNome.hidden = !cadastrar;

    document.getElementById("nome").required = cadastrar;
    campoSenha.autocomplete = cadastrar ? "new-password" : "current-password";

    titulo.textContent = cadastrar ? "Crie sua conta" : "Entre na sua conta";
    botaoEnviar.textContent = cadastrar ? "Criar conta" : "Entrar";

    botaoEntrar.classList.toggle("ativa", !cadastrar);
    botaoCadastrar.classList.toggle("ativa", cadastrar);

    mensagem.textContent = "";
}

botaoEntrar.addEventListener("click", function () {
    mostrarFormulario(false);
});

botaoCadastrar.addEventListener("click", function () {
    mostrarFormulario(true);
});

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

});
