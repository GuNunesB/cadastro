/**
 * preload.js - Usado no framework electron para aumentar a segurança e o desempenho
 */

// importação do electron
// estabelece comunicação entre processos main <=e=> renderer
// contextBridge: permições de comunicação entre processos, usando a api do electron
const { ipcRenderer, contextBridge } = require('electron')

//enviar mensagem ao main para esabelecer uma conecção com o banco de dados 
ipcRenderer.send('db-connect')

// permições para estabelecer a comunicação entre processos
contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit')
})