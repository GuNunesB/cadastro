/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose
 */

// importação do mongoose
const mongoose = require('mongoose')

// configuração do banco de dados
// ip/link do servidor, autenticação 
// ao final da url definir o nome do banco de dados
// exemplo: /dbnotes
const url = 'mongodb+srv://admin:123Senac@cluster0.vi8rq.mongodb.net/dbnotes'

// validação (evitar a abertura de várias conexões)
let conectado = false

// método para conectar com o banco de dados
const conectar = async () => {
    // se não estiver conectado
    if (!conectado) {
        //conectar com o banco de dados
        try {
            await mongoose.connect(url) //conectar
            conectado = true //setar a variável
            console.log("MongoDB conectado")
        } catch (error) {
            //tratamento de exceções especificas
            if(error.code = 110000) {
                console.log(`Erro: O CPF ${cpfCli} já está cadastrado `)
            }else {
             console.log(error)

            }
           
        }
    }
}

// método para desconectar do banco de dados
const desconectar = async () => {
    // se estiver conectado
    if (conectado) {
        // desconectar
        try {
            await mongoose.disconnect(url) //desconectar
            conectado = false //setar a variável
            console.log("MongoDB desconectado")
        } catch (error) {
            console.log(error)
        }
    }
}

//exportar para o main os métodos conectar e desconectar
module.exports = { conectar, desconectar }