const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const clienteModel = require('./src/models/Clientes.js')

const fs = require('fs')

const { jspdf, default: jsPDF } = require('jspdf')

let win
const createWindow = () => {
  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 1010,
    height: 820,

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
    label: 'Home',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Esc'
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Ampliar',
        role: 'zoomIn',
        accelerator: 'Ctrl+='
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

ipcMain.on('create-cliente', async (event, newCliente) => {
  console.log(newCliente)

  try {
    const newClientes = clienteModel({
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

    await newClientes.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso.",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })

  } catch (error) {
    if(error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção!",
        message: "CPF já cadastrado. \nVerifique o número digitado.",
        buttons: ['OK']

      }).then((result) => {
        if(result.response === 0) {
          event.reply('reset-cpf')
        }

      })
    } else {
      console.log(error)
    }
  }
})

async function relatorioClientes() {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    
    doc.setFontSize(11)
    doc.text(`Data: ${dataAtual}`, 165,15)

    doc.setFontSize(18)
    doc.text("Relatório de Clientes", 15,15)

    doc.setFontSize(14)
    let y = 50
    doc.text("Nome: ", 15, y)
    doc.text("Telefone: ", 80, y)
    doc.text("Email: ", 130, y)
    y += 5

    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y)

    y += 10

    const clientes = await clienteModel.find().sort({nomeCliente: 1})
    
    clientes.forEach((c) => {
      if (y> 280) {
        doc.addPage()
        y = 20

        doc.text("Nome: ", 15, y)
        doc.text("Telefone: ", 80, y)
        doc.text("Email: ", 130, y)
        y += 5

        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)

        y += 10
      }
      doc.text(c.nomeCliente, 15, y)
      doc.text(c.telCliente, 85, y)
      doc.text(c.email, 130, y)
      y += 10
    })

    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(`Página ${i} de ${pages}`, 90, 290, { aling: 'center' })
    }
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    doc.save(filePath)
    shell.openPath(filePath)
    
  } catch (error) {
    console.log(error)
  }
}

ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
      type: 'warning',
      title: 'Atenção',
      message: 'Preencha o campo de busca',
      buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, cliName) => {
  try {
      const client = await clienteModel.find({
        nomeCliente: new RegExp(cliName, 'i')
      })

      console.log(client)

      if (client.length === 0) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Aviso',
          message: 'Cliente não cadastrado.\nDeseja cadastrar esse cliente?',
          defaultId: 0,
          buttons: ['Sim', 'Não']
        }).then((result) => {
         if (result.response === 0) {
          event.reply('set-name')
          
         } else {
          event.reply('reset-form')

         }
        })
      } else {
        event.reply('render-client', JSON.stringify(client))
      }
      
  } catch (error) {
      console.log(error)
  }
})

ipcMain.on('search-cpf', async (event, cliCpf) => {
  try {
      const client = await clienteModel.find({
        cpf: new RegExp(cliCpf, 'i')
      })

      console.log(client)

      if (client.length === 0) {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Aviso',
          message: 'Cliente não cadastrado.\nDeseja cadastrar esse cliente?',
          defaultId: 0,
          buttons: ['Sim', 'Não']
        }).then((result) => {
         if (result.response === 0) {
          event.reply('set-cpf')
          
         } else {
          event.reply('reset-form')

         }
        })
      } else {
        event.reply('render-client', JSON.stringify(client))

      }
      
  } catch (error) {
      console.log(error)
  }
})

ipcMain.on('delete-client', async (event, id) => {
  const result = await dialog.showMessageBox(win, {
      type: 'warning',
      title: "Atenção!",
      message: "Tem certeza que deseja excluir este cliente?\nEsta ação não poderá ser desfeita.",
      buttons: ['Cancelar', 'Excluir']
  })
  if (result.response === 1) {
      try {
          const delClient = await clienteModel.findByIdAndDelete(id)
          event.reply('reset-form')
      } catch (error) {
          console.log(error)
      }
  }
})

ipcMain.on('update-client', async (event, cliente) => {
  try {
      const updateClient = await clienteModel.findByIdAndUpdate(
          cliente.idCli,
          {
            nomeCliente: cliente.nomeCli,
            telCliente: cliente.telCli,
            email: cliente.emailCli,
            senha: cliente.senhaCli,
            cep: cliente.cepCli,
            cidade: cliente.cidadeCli,
            uf: cliente.ufCli,
            logradouro: cliente.logradouroCli,
            bairro: cliente.bairroCli,
            cpf: cliente.cpfCli,
            complemento: cliente.complementoCli,
          },
          {
              new: true
          }
      )        

      dialog.showMessageBox({
          type: 'info',
          title: "Aviso",
          message: "Dados do cliente alterados com sucesso",
          buttons: ['OK']
      }).then((result) => {
          if (result.response === 0) {
              event.reply('reset-form')
          }
      })
  } catch (error) {
      if (error.code === 11000) {
          dialog.showMessageBox({
              type: 'error',
              title: "Atenção!",
              message: "CPF já cadastrado.\nVerifique o número digitado.",
              buttons: ['OK']
          }).then((result) => {
              if (result.response === 0) {
              }
          })
      } else {
          console.log(error)
      }
  }
})