const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('liuyaoAPI', {
  platform: process.platform
});
