import React from 'react'
import ReactDom from 'react-dom'
// Load Components
import { Window, Content } from 'react-photonkit'
import { trackEvent } from '../../stats'
import { dialog } from 'electron'

// Load API and custom stuff
import {
  initIPFSClient,
  getPeersInfo,
  getRepoInfo,
  getStorageList,
  getObjectList,
  promiseIPFSReady
} from '../../api'
import { setupAddAppOnDrop } from './fileIntegration'

// Load Custom Components
import Header from './Components/Header'
import StorageList from './Components/StorageList'
import Footer from './Components/Footer'

// Load MobX Stores
import StorageStore from './Stores/Storage'
import StatusStore from './Stores/Status'

const { captureException, captureMessage } = require('@sentry/electron')

// Setup drag and drop events for adding files
setupAddAppOnDrop()
initIPFSClient()

// This will store the loop's timeout ID
window.loopTimeoutID = null

function startLoop () {
  // Runs multiple promises for gathering the content
  Promise.all([
    // get peers info
    getPeersInfo()
      .then((peers) => {
        StatusStore.peers = peers
      }),
    // Get the repository (pins)
    getRepoInfo()
      .then((stats) => {
        StatusStore.stats = stats
      }),
    // Get the objects lists and sorted
    getObjectList()
      .then(getStorageList)
      .then((pins) => {
        StorageStore.elements = pins
      })
  ])
    .then(() => {
      StatusStore.connected = true
      window.loopTimeoutID = setTimeout(startLoop, 1 * 1000)
    })
    .catch((err) => {
      alert(err)
    })
}

class App extends React.Component {
  componentDidMount () {
    trackEvent('StorageWindowOpen', {})
    promiseIPFSReady()
      .then(startLoop)
      .catch(err => {
        let message
        if (typeof err === 'string') {
          message = err
        } else if (err.message) {
          message = err.message
        } else {
          message = JSON.stringify(err)
        }
        dialog.showMessageBox({ type: 'warning', message })
        // sentry reporting
        if (typeof err === 'string') {
          captureMessage(err)
        } else {
          captureException(err)
        }
      })
  }

  componentWillUnmount () {
    clearTimeout(window.loopTimeoutID)
  }

  render () {
    return (
      <Window>
        <Header storageStore={StorageStore} />

        <Content>
          <StorageList storageStore={StorageStore} />
        </Content>

        <Footer statusStore={StatusStore} />
      </Window>
    )
  }
}

// Render the APP
ReactDom.render(<App />, document.querySelector('#host'))
