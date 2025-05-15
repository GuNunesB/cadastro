const mongoose = require('mongoose')

const url = 'mongodb+srv://admin:123Senac@cluster0.vi8rq.mongodb.net/dbClientes2'


let conectado = false

const conectar = async () => {
    if (!conectado) {
        try {
            await mongoose.connect(url)
            conectado = true
            console.log("MongoDB conectado")
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

const desconectar = async () => {
    if (conectado) {
        try {
            await mongoose.disconnect(url)
            conectado = false
            console.log("MongoDB desconectado")
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}

module.exports = { conectar, desconectar }