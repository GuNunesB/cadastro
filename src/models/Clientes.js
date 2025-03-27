const { model, Schema } = require('mongoose')

const clinteSchema = new Schema({
    nomeCliente: {
        type: String
    },
    telCliente: {
        type: String
    },
    email: {
        type: String,
    },
    senha: {
        type: String,
    },
    cep: {
        type: String,
    },
    cidade: {
        type: String,
    },
    uf: {
        type: String,
    },
    logradouro: {
        type: String,
    },
    bairro: {
        type: String,
    },
    cpf: {
        type: String,
        unique: true,
        index: true
    },
    complemento: {
        type: String
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false})

module.exports = model('Clientes', clinteSchema)