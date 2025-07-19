const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPI公開
contextBridge.exposeInMainWorld('electronAPI', {
  getModes: () => ipcRenderer.invoke('get-modes'),
  launchMode: (modePath) => ipcRenderer.invoke('launch-mode', modePath),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  processAgain: () => ipcRenderer.invoke('process-again'),
  onModesUpdate: (callback) => {
    ipcRenderer.on('modes-updated', callback);
    return () => ipcRenderer.removeListener('modes-updated', callback);
  },
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
