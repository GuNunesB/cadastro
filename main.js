const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

const path = require('node:path')

const { conectar, desconectar } = require('./database.js')

const clienteModel = require('./src/models/Clientes.js')

// Manipulação de Arquivos
const fs = require('fs')

const { jspdf, default: jsPDF } = require('jspdf')

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

//= CRUD CREATE ===============================================//

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

//= FIM CRUD CREATE ===============================================//

//= CRUD READ ======================================================//

async function relatorioClientes() {
  try {
    //Configuração do pdf
    // p = portrait; mm = milimetros; a4 = tamanho do arquivo ( 210mm x 297mm);
    const doc = new jsPDF('p', 'mm', 'a4')

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    
    doc.setFontSize(11)
    doc.text(`Data: ${dataAtual}`, 165,15) // (x, y)

    doc.setFontSize(18)
    doc.text("Relatório de Clientes", 15,15)

    doc.setFontSize(14)
    let y = 50
    doc.text("Nome: ", 15, y)
    doc.text("Telefone: ", 80, y)
    doc.text("Email: ", 130, y)
    y += 5

    doc.setLineWidth(0.5) //Linha
    doc.line(10, y, 200, y)

    y += 10

    const clientes = await clienteModel.find().sort({nomeCliente: 1}) // .sort() deixa em ordem alfabetica
    
    clientes.forEach((c) => {
      if (y> 280) {
        doc.addPage()
        y = 20

        doc.text("Nome: ", 15, y)
        doc.text("Telefone: ", 80, y)
        doc.text("Email: ", 130, y)
        y += 5

        doc.setLineWidth(0.5) //Linha
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
    //------------------------------------------------------------------------//
    // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    // salvar temporariamente o arquivo
    doc.save(filePath)
    // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
    
  } catch (error) {
    console.log(error)
  }
}

// == Crud Read ===============================================

// validação da busca
ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
      type: 'warning',
      title: 'Atenção',
      message: 'Preencha o campo de busca',
      buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, cliName) => {
  // teste de recebimento do nome do cliente (passo2)
  console.log(cliName)
  try {
      // Passos 3 e 4 (busca dos dados do cliente pelo nome)
      // RegExp (expressão regular 'i' -> insensitive (ignorar letra smaiúsculas ou minúsculas))
      const client = await clientModel.find({
          nomeCliente: new RegExp(cliName, 'i')
      })

      // teste da busca do cliente pelo nome (passos 3 e 4)
      console.log(client)

      if (client.length === 0) {
        //questionar o usuário
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
        // enviar ao renderizador (rendererCliente) os dados do cliente (passo 5) OBS: não esquecer de converter para string "JSON.stringify"
        event.reply('render-client', JSON.stringify(client))

      }
      
  } catch (error) {
      console.log(error)
  }
})

// == Fim - Crud Read =========================================