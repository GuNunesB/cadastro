const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const clienteModel = require('./src/models/Clientes.js')

let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010,
    height: 780,

    webPreferences: {
      preload: path.join(__dirname, './preload.js')
    }
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(templete))

  win.loadFile('./src/views/index.html')
}

let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'

  const mainWindow = BrowserWindow.getFocusedWindow()

  if (mainWindow) {
    about = new BrowserWindow({
      width: 415,
      height: 350,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, './preload.js')
      }
    })
  }


  about.loadFile('./src/views/sobre.html')

  ipcMain.on('about-exit', () => {
    if (about && !about.isDestroyed()) {
      about.close()
    }
   
  })
}


app.whenReady().then(() => {
  createWindow()

  ipcMain.on('db-connect', async (event) => {
    const conectado = await conectar()
    if (conectado) {
      setTimeout(() => {
        event.reply('db-status', "conectado")
      }, 500)
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await desconectar()
})

app.commandLine.appendSwitch('log-level', '3')
 
const templete = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Esc'
      }
    ]
  },
  {
    label: 'Relatório',
    submenu: [
      {
        label: 'Clientes',
        accelerator: 'Alt+C'
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Ampliar',
        role: 'zoomIn',
        accelerator: 'Ctrl++'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut',
        accelerator: 'Ctrl+-'
      },
      {
        label: 'Tamanho padrão',
        role: 'resetZoom',
        accelerator: 'Ctrl+0'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools',
        accelerator: 'Ctrl+Shift'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/GuNunesB/cadastro')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

//= CRUD CREATE ===============================================//

//Recebe o objeto com os dados
ipcMain.on('create-cliente', async (event, newCliente) => {
  console.log(newCliente)

  const newClientes = clienteModel({ // nomeCampo: newCliente.caompoRenderer,
    nomeCliente: newCliente.nomeCli,
    telCliente: newCliente.telCli,
    email: newCliente.emailCli,
    senha: newCliente.senhaCli,
    cep: newCliente.cepCli,
    cidade: newCliente.cidadeCli,
    uf: newCliente.ufCli,
    logradouro: newCliente.logradouroCli,
    bairro: newCliente.bairroCli,
    cpf: newCliente.cpfCli,
    complemento: newCliente.complementoCli,
  })

  // Salvar no MongoDB
  newclientes.save()
})