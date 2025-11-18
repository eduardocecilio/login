// Chave usada no localStorage para guardar o "arquivo" do banco
const DB_KEY = "login_db_v1";

let db;
let dbReady = initDb();

// Inicializa o SQLite em JS e carrega/cria banco
async function initDb() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });

    const salvo = localStorage.getItem(DB_KEY);

    if (salvo) {
        // carrega o banco salvo
        const arr = JSON.parse(salvo);      // vira array de números
        const u8 = new Uint8Array(arr);     // Uint8Array
        db = new SQL.Database(u8);
        console.log("Banco carregado do localStorage.");
    } else {
        // cria novo banco
        db = new SQL.Database();
        console.log("Banco novo criado em memória.");
    }

    // garante que a tabela exista (idempotente)
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username   TEXT NOT NULL UNIQUE,
            email      TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL
        );
    `);

    // se era banco novo, salva pela primeira vez
    if (!salvo) {
        salvarDb();
    }
}

// Salva o banco atual no localStorage
function salvarDb() {
    const data = db.export();              // Uint8Array
    const arr = Array.from(data);         // vira array normal
    localStorage.setItem(DB_KEY, JSON.stringify(arr));
}

// ==== FUNÇÕES SQL ====

// Cadastrar usuário
function sqlCadastrarUsuario(username, email, senha) {
    const stmt = db.prepare(
        "INSERT INTO usuarios (username, email, senha_hash) VALUES (?, ?, ?)"
    );

    try {
        stmt.run([username, email, senha]);
        console.log("Usuário cadastrado:", username, email);
        salvarDb(); // persiste alteração
    } finally {
        stmt.free();
    }
}

// Login
function sqlLogin(loginDigitado, senhaDigitada) {
    const stmt = db.prepare(`
        SELECT id, username, email
        FROM usuarios
        WHERE (username = ? OR email = ?) AND senha_hash = ?
    `);

    try {
        stmt.bind([loginDigitado, loginDigitado, senhaDigitada]);

        if (stmt.step()) {
            const row = stmt.getAsObject();
            return {
                ok: true,
                username: row.username,
                email: row.email
            };
        } else {
            return {
                ok: false,
                erro: "Usuário ou senha inválidos."
            };
        }
    } finally {
        stmt.free();
    }
}

// ==== LOGIN ====
const formLogin = document.getElementById("form-login");

if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        await dbReady; // garante banco pronto

        const loginDigitado = document.getElementById("campo-login").value.trim();
        const senhaDigitada = document.getElementById("senha").value.trim();

        if (!loginDigitado || !senhaDigitada) {
            alert("Preencha login e senha.");
            return;
        }

        try {
            const resultado = sqlLogin(loginDigitado, senhaDigitada);

            if (resultado.ok) {
                alert("Login realizado com sucesso para " + resultado.username + "!");
                // ex: window.location.href = "home.html";
            } else {
                alert(resultado.erro);
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro ao consultar o banco.");
        }
    });
}

// ==== CADASTRO ====
const formCadastro = document.getElementById("form-cadastro");

if (formCadastro) {
    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();

        await dbReady; // garante banco pronto

        const novoUsuario = document.getElementById("novo-usuario").value.trim();
        const novoEmail   = document.getElementById("novo-email").value.trim();
        const novaSenha   = document.getElementById("nova-senha").value.trim();

        if (!novoUsuario || !novoEmail || !novaSenha) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        try {
            try {
                sqlCadastrarUsuario(novoUsuario, novoEmail, novaSenha);
                alert("Conta criada com sucesso!");
                window.location.href = "index.html";
            } catch (e) {
                const msg = String(e.message || e);
                if (msg.includes("UNIQUE")) {
                    alert("Usuário ou e-mail já cadastrados.");
                } else {
                    console.error(e);
                    alert("Erro ao cadastrar usuário.");
                }
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro ao acessar o banco.");
        }
    });
}
