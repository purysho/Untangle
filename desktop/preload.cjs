const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "untangleAI",
  Object.freeze({
    status: () => ipcRenderer.invoke("ai:status"),
    start: () => ipcRenderer.invoke("ai:start"),
    stop: () => ipcRenderer.invoke("ai:stop"),
    explain: (request) => ipcRenderer.invoke("ai:explain", request),
  }),
);
