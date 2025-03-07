console.log('Hello from Electron 👋')

const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron/main')

const createWindow = () => {
  nativeTheme.themeSource = 'light'
  const win = new BrowserWindow({
    width: 800,
    height: 600
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
      width: 320,
      height: 300,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: mainWindow,
      modal: true
    })
  }
  about.loadFile('./src/views/sobre.html')
}

app.whenReady().then(() => {
  createWindow()

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

app.commandLine.appendSwitch('log-level', '3')

const templete =[
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