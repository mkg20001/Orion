/**
 * Import/require this file to set up the Menu of the windows
 */

import electron, { BrowserWindow, Menu, app, dialog } from 'electron'

import ImportWindow from './windows/Import/window'
import SettingsWindow from './windows/Settings/window'
import ResolveIPNS from './windows/ResolveIPNS/window'
import PublishToIPNS from './windows/PublishToIPNS/window'

import { addFilesPaths } from './windows/Storage/fileIntegration'

const template = [{
  label: 'File',
  submenu: [{
    label: 'Add File',
    click () {
      const selectOptions = {
        title: 'Add File',
        properties: ['openFile', 'multiSelections']
      }

      const paths = dialog.showOpenDialog(app.mainWindow, selectOptions)
      addFilesPaths(paths)
    }
  }, {
    label: 'Add Directory',
    click () {
      const selectOptions = {
        title: 'Add Directory',
        properties: ['openDirectory', 'multiSelections']
      }

      const paths = dialog.showOpenDialog(app.mainWindow, selectOptions)
      addFilesPaths(paths)
    }
  },
  {
    label: 'Import from hash',
    accelerator: 'CmdOrCtrl+D',
    click () {
      ImportWindow.create(app)
    }
  }, {
    label: 'Resolve IPNS',
    accelerator: 'CmdOrCtrl+F',
    click () {
      ResolveIPNS.create(app)
    }
  }, {
    label: 'Publish to IPNS',
    accelerator: 'CmdOrCtrl+E',
    click () {
      PublishToIPNS.create(app)
    }
  }]
}, {
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click (item, focusedWindow) {
      if (focusedWindow) {
        // on reload, start fresh and close any old
        // open secondary windows
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach((win) => {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: 'Toggle Developer Tools',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      }
      return 'Ctrl+Shift+I'
    }()),
    click (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }, {
    type: 'separator'
  }]
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }, {
    label: 'Reopen Window',
    accelerator: 'CmdOrCtrl+Shift+T',
    enabled: false,
    key: 'reopenMenuItem',
    click () {
      app.emit('activate')
    }
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Suggest new feature',
    click () {
      electron.shell.openExternal('https://github.com/Siderus/Orion/issues/new?template=Feature_request.md')
    }
  }, {
    label: 'Report a bug',
    click () {
      electron.shell.openExternal('https://github.com/Siderus/Orion/issues/new?template=Bug_report.md')
    }
  }, {
    label: 'Learn More',
    click () {
      electron.shell.openExternal('https://orion.siderus.io')
    }
  }]
}]

function addUpdateMenuItems (items, position) {
  if (process.mas) return

  const updateItems = [{
    label: 'Checking for Update',
    enabled: false,
    key: 'checkingForUpdate'
  }, {
    label: 'Check for Update',
    visible: false,
    key: 'checkForUpdate',
    click () {
      require('electron').autoUpdater.checkForUpdates()
    }
  }, {
    label: 'Restart and Install Update',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click () {
      require('electron').autoUpdater.quitAndInstall()
    }
  }]

  items.splice(...[position, 0].concat(updateItems))
}

function findReopenMenuItem () {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach((item) => {
    if (item.submenu) {
      item.submenu.items.forEach((subItem) => {
        if (subItem.key === 'reopenMenuItem') {
          reopenMenuItem = subItem
        }
      })
    }
  })
  return reopenMenuItem
}

if (process.platform === 'darwin') {
  const name = electron.app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      label: 'Preferences',
      role: 'preferences',
      accelerator: 'CommandOrControl+,',
      click () {
        const settingsWindow = SettingsWindow.create(app)
        settingsWindow.show()
      }
    }, {
      type: 'separator'
    }, {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click () {
        app.quit()
      }
    }]
  })

  // Window menu.
  template[3].submenu.push({
    type: 'separator'
  }, {
    label: 'Bring All to Front',
    role: 'front'
  })

  addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', () => {
  const reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', () => {
  const reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})
