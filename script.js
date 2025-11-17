// === "BANCO" FAKE NO LOCALSTORAGE ===
const USUARIO_KEY = "usuarioLoginFake";

function salvarUsuarioLocal(novoUsuario, novoEmail, novaSenha) {
    const dados = { usuario: novoUsuario, email: novoEmail, senha: novaSenha };
    localStorage.setItem(USUARIO_KEY, JSON.stringify(dados));
}

function buscarUsuarioLocal() {
    const dados = localStorage.getItem(USUARIO_KEY);
    return dados ? JSON.parse(dados) : null;
}

// === LÓGICA DA PÁGINA DE LOGIN ===
const formLogin = document.getElementById("form-login");

if (formLogin) {
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();
        
        const loginDigitado = document.getElementById("campo-login").value.trim();
        const senhaDigitada = document.getElementById("senha").value.trim();

        // usuário padrão de teste
        const emailPadrao = "dev@teste.com";
        const usuarioPadrao = "dev123";
        const senhaPadrao = "devsenha";

        const usuarioCadastrado = buscarUsuarioLocal();

        const loginConferePadrao =
            ((loginDigitado === emailPadrao) || (loginDigitado === usuarioPadrao)) &&
            senhaDigitada === senhaPadrao;

        const loginConfereCadastro =
            usuarioCadastrado &&
            ((loginDigitado === usuarioCadastrado.email) || (loginDigitado === usuarioCadastrado.usuario)) &&
            senhaDigitada === usuarioCadastrado.senha;

        if (loginConferePadrao || loginConfereCadastro) {
            alert("Login realizado com sucesso!");
            // futuramente: window.location.href = "home.html";
        } else {
            alert("Usuário ou senha incorretos.");
        }
    });
}

// === LÓGICA DA PÁGINA DE CADASTRO ===
const formCadastro = document.getElementById("form-cadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", (event) => {
        event.preventDefault();

        const novoUsuario = document.getElementById("novo-usuario").value.trim();
        const novoEmail   = document.getElementById("novo-email").value.trim();
        const novaSenha   = document.getElementById("nova-senha").value.trim();

        if (novoUsuario && novaSenha && novoEmail) {
            salvarUsuarioLocal(novoUsuario, novoEmail, novaSenha);

            alert("Conta criada com sucesso!");
            console.log("Salvar no SQL (futuro back):", novoUsuario, novoEmail);

            window.location.href = "index.html";
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    });
}
