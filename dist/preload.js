"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("eapi", {
    chromeVer: () => process.versions.chrome,
    electronVer: () => process.versions.electron,
    nodeVer: () => process.versions.node
});
