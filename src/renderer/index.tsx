import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import App from './components/App';
import ipcChannels from '../ipc_channels';
import { dumpStore } from './redux/store';
import { setupListeners } from './events';

import 'react-tooltip/dist/react-tooltip.css';

const electron = window.require('electron');
export const ipcRenderer = electron.ipcRenderer;

const DEBOUNCE_MS = 2 * 1000; // 2 seconds
let lastJobHandle: NodeJS.Timeout;

export function initializeApp(store: Store): void {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app'),
  );

  store.subscribe(() => {
    clearTimeout(lastJobHandle);
    lastJobHandle = setTimeout(() => {
      ipcRenderer.send(ipcChannels.SAVE, [dumpStore(store)]);
    }, DEBOUNCE_MS);
  });
}

setupListeners(ipcRenderer);

ipcRenderer.send(ipcChannels.LOAD_MOST_RECENT);

console.log('RENDERER PROCESS STARTED');
