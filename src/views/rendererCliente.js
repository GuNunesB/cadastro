// capturar o foco na busca pelo nome do cliente
// a constante foco obtem o elemento html (input) identificado como 'searchClient'
const foco = document.getElementById('searchClient')

// Criar um vetor global para extrair os dados do cliente
let arrayClient = []

// Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    // Desativar os botões
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    foco.focus()
})

//captura dos dados dos inputs do formulário (Passo 1: Fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUFClient')



// ============================================================
// == CRUD Read ===============================================

function searchName() {
    //console.log("teste do botão buscar")
    //capturar o nome a ser pesquisado (passo 1)
    let cliName = document.getElementById('searchClient').value
    console.log(cliName) // teste do passo 1
    // validação de campo obrigatório
    // se o campo de busca não foi preenchido
    if (cliName === "") {
        // enviar ao main um pedido para alertar o usuário
        // precisa usar o preload.js
        api.validateSearch()
    } else {
        //enviar o nome do cliente ao main (passo 2)
        api.searchName(cliName)
        //receber os dados do cliente (passo 5)
        api.renderClient((event, client) => {
            //teste de recebimento dos dados do cliente
            console.log(client)
            //passo 6 renderização dos dados do cliente (preencher os inputs do form) - Não esquecer de converte os dados de string para JSON
            const clientData = JSON.parse(client)
            arrayClient = clientData
            // uso do forEach para percorrer o vetor e extrair os dados
            arrayClient.forEach((c) => {
                nameClient.value = c.nomeCliente
                cpfClient.value = c.cpfCliente
                emailClient.value = c.emailCliente
                phoneClient.value = c.foneCliente
                cepClient.value = c.cepCliente
                addressClient.value = c.logradouroCliente
                numberClient.value = c.numeroCliente
                complementClient.value = c.complementoCliente
                neighborhoodClient.value = c.bairroCliente
                cityClient.value = c.cidadeCliente
                ufClient.value = c.ufCliente
            })
        })
    }
}

// == Fim - CRUD Read =========================================
// ============================================================

api.setName((args) => {
    console.log("T. T. T. T. TESTANDO")
    
    let busca = documetn.getElementById('searchClient').value
    nameClient.focus()

    foco.value = ""

    nameClient.value = busca
})

// ============================================================
// == Reset Form ==============================================
function resetForm() {
    location.reload()
}

api.resetForm((args) => {
    resetForm()
})
// == Fim Reset Form ==========================================
// ============================================================