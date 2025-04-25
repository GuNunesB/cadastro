const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    aboutExit: () => ipcRenderer.send('about-exit'),
    addCliente: (newCliente) => ipcRenderer.send('create-cliente', newCliente),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    resetCpf: (args) => ipcRenderer.on('reset-cpf', args),
    searchName: (cliName) => ipcRenderer.send('search-name', cliName),
    searchCpf: (cliCpf) => ipcRenderer.send('search-cpf', cliCpf),
    renderClient: (client) => ipcRenderer.on('render-client', client),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setName: (args) => ipcRenderer.on('set-name', args),
    setCpf: (args) => ipcRenderer.on('set-cpf', args)
})