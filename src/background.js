"use strict";

import { app, protocol, BrowserWindow, screen, ipcMain, globalShortcut } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import os from 'os'
const log = require('electron-log');
const path = require("path")
log.transports.console.level = 'debug';
log.transports.file.resolvePath =()=> '/home/wufang/logs/1.log'
//import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

import { initExtra, createTray, createAppMenu } from "@/utils/backgroundExtra";

import { autoUpdater } from "electron-updater";

import windowStateKeeper from "electron-window-state";

import pkg from "../package.json";

let win;

if (app.requestSingleInstanceLock()) {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (win) {
      
      setPosition();
    }
  });
} else {
  app.quit();
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

createAppMenu();

async function createWindow() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 320,
    defaultHeight: 400
  });
  // log.error("jfvoiasdjvl");
  // Create the browser window.
  win = new BrowserWindow({

    x: mainWindowState.x,
    y: mainWindowState.y,
    icon:path.join(__static, "./tray.png"),
    width:320,
    height:395,
    maxWidth:320,
    maxHeight:395,
    // width: mainWindowState.width,
    // height: mainWindowState.height,
    // minWidth: 300,
    // minHeight: 400,
    // type: "toolbar",
    frame: false,
    title: pkg.name,
    transparent:true,
    //resizable: false,
    minimizable: false,
    maximizable: false,
    // skipTaskbar: true,
    


    //closable: false,
    //show: false,
    //alwaysOnTop: true,
    //useContentSize: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  });
 

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);

  if (mainWindowState.x == undefined || mainWindowState.y == undefined)
    setPosition();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }

  // win.once("ready-to-show", () => {
  //   win.show();
  // });

  //屏蔽windows原生右键菜单
  if (process.platform === "win32") {
    //int WM_INITMENU = 0x116;
    //当一个下拉菜单或子菜单将要被激活时发送此消息，它允许程序在它显示前更改菜单，而不要改变全部
    win.hookWindowMessage(278, function (e) {
      win.setEnabled(false); //窗口禁用

      setTimeout(() => {
        win.setEnabled(true); //窗口启用
      }, 100); //延时太快会立刻启用，太慢会妨碍窗口其他操作，可自行测试最佳时间

      return true;
    });
  }

  win.on("closed", () => {
    win = null;
  });
}

//闪烁问题
app.commandLine.appendSwitch("wm-window-animations-disabled");

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) init();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS);
  //   } catch (e) {
  //     console.error("Vue Devtools failed to install:", e.toString());
  //   }
  // }createWindow()

  init();
  // log.error(win.);
  globalShortcut.register("ctrl+shift+n",()=>{
    // win.setIgnoreMouseEvents(false);
    // win.webContents.send('send_txt',"fjapodfjao");s
     win.webContents.send('send_txt')
  });
  // let isR = globalShortcut.isRegistered("ctrl+shift+n")? "OK" : "FALSE";
  // log.error(isR);
});








function init() {
  createWindow();
  initExtra();
  createTray(showWindow);
  //createAppMenu();
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

function setPosition() {
  const size = screen.getPrimaryDisplay().workAreaSize;
  const winSize = win.getSize();
  win.setPosition(size.width - winSize[0] - 30, 30);
}

function showWindow() {
  //if (!win.isVisible())
  win.show();
}

function change()
{
  win.setIgnoreMouseEvents(false);
}
ipcMain.handle("setIgnoreMouseEvents", (event, ignore) => {
  if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
  else win.setIgnoreMouseEvents(false);
});



ipcMain.handle("hideWindow", event => {
  win.hide();
});



