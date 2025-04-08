import { versions } from "node:process";
import { contextBridge } from "electron";
contextBridge.exposeInMainWorld("eapi", {
    chromeVer: () => versions.chrome,
    electronVer: () => versions.electron,
    nodeVer: () => versions.node
});
