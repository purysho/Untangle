const {
  app,
  BrowserWindow,
  protocol,
  session,
  shell,
  net,
  Menu,
  dialog,
} = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { resolveAsset, isAllowedExternal } = require("./policy.cjs");
protocol.registerSchemesAsPrivileged([
  {
    scheme: "untangle",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      codeCache: true,
    },
  },
]);
const home = "untangle://app/";
let mainWindow;
const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();
else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
  app
    .whenReady()
    .then(async () => {
      const assetRoot = path.join(app.getAppPath(), "dist");
      protocol.handle("untangle", async (request) => {
        const relative = resolveAsset(request.url);
        if (!relative) return new Response("Not found", { status: 404 });
        try {
          const response = await net.fetch(
            pathToFileURL(path.join(assetRoot, relative)).toString(),
          );
          const headers = new Headers(response.headers);
          headers.set(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'",
          );
          headers.set("X-Content-Type-Options", "nosniff");
          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      });
      session.defaultSession.setPermissionRequestHandler(
        (_webContents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      session.defaultSession.on("will-download", (_event, item) => {
        item.setSaveDialogOptions({
          title: "Export Untangle analysis",
          defaultPath: path.join(
            app.getPath("documents"),
            "Untangle-analysis.json",
          ),
          filters: [{ name: "JSON analysis", extensions: ["json"] }],
        });
      });
      function createWindow() {
        mainWindow = new BrowserWindow({
          width: 1440,
          height: 1000,
          minWidth: 390,
          minHeight: 640,
          title: "Untangle",
          backgroundColor: "#10171d",
          show: false,
          icon: path.join(app.getAppPath(), "build", "icon.png"),
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
          },
        });
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
          if (isAllowedExternal(url)) void shell.openExternal(url);
          return { action: "deny" };
        });
        mainWindow.webContents.on("will-navigate", (event, url) => {
          if (url !== home) {
            event.preventDefault();
            if (isAllowedExternal(url)) void shell.openExternal(url);
          }
        });
        mainWindow.once("ready-to-show", () => mainWindow.show());
        mainWindow.on("closed", () => {
          mainWindow = null;
        });
        mainWindow.webContents.on(
          "did-fail-load",
          (_event, code, description) => {
            if (code !== -3)
              dialog.showErrorBox("Untangle could not load", description);
          },
        );
        void mainWindow.loadURL(home);
      }
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          ...(process.platform === "darwin"
            ? [
                {
                  label: app.name,
                  submenu: [
                    { role: "about" },
                    { type: "separator" },
                    { role: "hide" },
                    { role: "hideOthers" },
                    { role: "unhide" },
                    { type: "separator" },
                    { role: "quit" },
                  ],
                },
              ]
            : []),
          {
            label: "Edit",
            submenu: [
              { role: "undo" },
              { role: "redo" },
              { type: "separator" },
              { role: "cut" },
              { role: "copy" },
              { role: "paste" },
              { role: "selectAll" },
            ],
          },
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
            ],
          },
          {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "close" }],
          },
        ]),
      );
      createWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
      });
    })
    .catch((error) => {
      dialog.showErrorBox("Untangle startup failed", String(error));
      app.quit();
    });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
