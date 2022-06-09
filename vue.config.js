const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          appId: "vue-explorer",
          target: "NSIS",
          icon: "./public/folder.png",
        },
        nsis: {
          installerIcon: "./public/folder.ico",
          uninstallerIcon: "./public/folder.ico",
          uninstallDisplayName: "vue-explorer uninstaller",
          oneClick: false,
          allowToChangeInstallationDirectory: true,
        },
        productName: "Vue-Explorer",
      }
    }
  }
})
