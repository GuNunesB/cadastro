console.log("Processo de renderização")

function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

api.dbStatus((event, message) => {
    console.log(message)
    if (message === "conectado") {
        document.getElementById('icondb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('icondb').src = "../public/img/dboff.png"
    }
})

// processo de cadastro do cliente //

console.log("teste")

const foco = document.getElementById('inputNome')

document.addEventListener('DOMContentLoaded', () => {
    // Desativar botões
    btnUpdate.disabled = true
    btnDelete.disabled = true

    foco.focus()// iniciar documento com foco na caixa de texto
})

// Captura de dados
let formCli = document.getElementById('formCli')
let nome = document.getElementById('inputNome')
let tel = document.getElementById('inputTel')
let email = document.getElementById('inputEmail4')
let senha = document.getElementById('inputPassword4')
let cep = document.getElementById('cep')
let cidade = document.getElementById('cidade')
let uf = document.getElementById('uf')
let logradouro = document.getElementById('logradouro')
let bairro = document.getElementById('bairro')
let cpf = document.getElementById('cpf')
let complemento = document.getElementById('inputCompl')

//= CRUD CREATE ===============================================//

formCli.addEventListener('submit', async (event) => {
    // evitar comportamento padrão de recarregar a página
    event.preventDefault()

    console.log(
        nome.value, 
        tel.value,
        email.value,
        senha.value,
        cep.value,
        cidade.value,
        uf.value,
        logradouro.value,
        bairro.value,
        cpf.value
    )

    const newCliente = {
        nomeCli: nome.value,
        telCli: tel.value,
        emailCli: email.value,
        senhaCli: senha.value,
        cepCli: cep.value,
        cidadeCli: cidade.value,
        ufCli: uf.value,
        logradouroCli: logradouro.value,
        bairroCli: bairro.value,
        cpfCli: cpf.value,
        complementoCli: complemento.value
    }

    api.addCliente(newCliente)

})

// fim processo de cadastro do cliente //

/*Validadores para cadastro de um cliente*/

// Validação de e-mail
function validarEmail() {
    let email = document.getElementById('inputEmail4').value;
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let emailInput = document.getElementById('inputEmail4');

    if (!regexEmail.test(email)) {
        alert('E-mail inválido! Insira um e-mail válido.');
        emailInput.focus();
        return false;
    }
    return true;
}

// Validação de CPF
function validarCPF() {
    let cpfInput = document.getElementById('cpf');
    let cpfErro = document.getElementById('cpfErro');
    let cpf = cpfInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Resetando mensagens e estilos
    cpfErro.textContent = "";
    cpfInput.style.border = "";

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        cpfErro.textContent = "CPF inválido! Insira um CPF válido.";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        cpfErro.textContent = "CPF inválido!";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        cpfErro.textContent = "CPF inválido!";
        cpfInput.style.border = "2px solid red";
        return false;
    }

    cpfInput.style.border = "2px solid green";
    return true;
}


// Validação de CEP
function buscarEndereco() {
    let cepInput = document.getElementById('cep');
    let cepErro = document.getElementById('cepErro');
    let cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    // Resetando mensagens e estilos
    cepErro.textContent = "";
    cepErro.style.color = "red";
    cepInput.style.border = "";

    if (cep.length !== 8) {
        cepErro.textContent = "CEP inválido! Insira um CEP válido com 8 dígitos.";
        cepInput.style.border = "2px solid red";
        return;
    }

    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`;

    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            if (dados.erro) {
                cepErro.textContent = "CEP não encontrado!";
                cepInput.style.border = "2px solid red";
                return;
            }

            // Preenche os campos com os dados do CEP
            document.getElementById('logradouro').value = dados.logradouro || '';
            document.getElementById('bairro').value = dados.bairro || '';
            document.getElementById('cidade').value = dados.localidade || '';
            document.getElementById('uf').value = dados.uf || '';

            cepInput.style.border = "2px solid #008000";
        })
        .catch(error => {
            console.error('Erro ao buscar o endereço:', error);
            cepErro.textContent = "Erro ao consultar o CEP.";
            cepInput.style.border = "2px solid red";
        });
}

//= RESET FORM ================================================//

function resetForm() {
    location.reload()
}


api.resetForm((args) => {
    resetForm()
})

//= FIM RESET FORM ============================================//

//= RESET CPF ================================================//

function resetCpf() {
    const ErroCpf = document.getElementById('cpf')
    ErroCpf.style.border = "2px solid red";
    ErroCpf.value = ""
    ErroCpf.focus()

}


api.resetCpf((args) => {
    resetCpf()
})

//= FIM RESET CPF ============================================//