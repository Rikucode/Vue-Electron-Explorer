<template>
  <table class="table" v-if="!squareIcons">
    <tbody >
      <tr class="clickable open" style="color:green;" @click="$emit('back')">
        <td class="icon-row align-middle text-center" style="color:aliceblue;">
          <IconFolderOpen class="icon-folder" v-if="darkTheme"/>
          <IconFolderOpen class="icon-folder" v-else style="fill:black;" />
        </td>
        <td class="pt-3" style="color:aliceblue;" v-if="darkTheme">...</td>
        <td style="color:black;" v-else>...</td>
        <td></td>
      </tr>
      <tr 
        class="open clickable"
        v-for="file in files"
        :key="file.name"
        @click="onFileClick(file)"
        :title="file.name"
        @contextmenu="conextMenu(file, $event)"
      >
        <td class="icon-row p-1 text-center" style="color:aliceblue;" v-if="darkTheme">
          <IconFolder v-if="file.directory" class="icon-folder" />
          <IconFile v-else-if="!file.error" class="icon-file" :extension="getExt(file)" />
          <IconFileError v-else class="icon-file"/>
        </td>
        <td class="icon-row p-1 text-center" style="color:black;" v-else>
          <IconFolder v-if="file.directory" class="icon-folder" />
          <IconFile v-else-if="!file.error" class="icon-file" :extension="getExt(file)" />
          <IconFileError v-else class="icon-file"/>
        </td>
        <td class="w-100 align-middle" style="color:aliceblue;" v-if="darkTheme">{{ file.name }}</td>
        <td class="w-100 align-middle" style="color:black;" v-else>{{ file.name }}</td>
        <td class="align-middle">
          <span class="float-end" style="white-space: nowrap; color:aliceblue;" v-if="darkTheme">{{ fileSize(file, checked) }}</span>
          <span class="float-end" style="white-space: nowrap; color:black;" v-else>{{ fileSize(file, checked) }}</span>
        </td>
      </tr>
    </tbody>
  </table>

  <div v-else>
    <div
      class="clickable d-inline-flex btn btn-outline-light m-1 p-0"
      @click="$emit('back')"
      style="width: 100px; height: 100px"
    >
      <table class="w-100 h-100">
        <tr>
          <td>
            <IconFolderOpen class="icon-folder" :fontsize="40" />
          </td>
        </tr>
        <tr>
          <td>
            ...
          </td>
        </tr>
      </table>
    </div>
    <div>
    <div
      class="clickable d-inline-flex btn btn-outline-light m-1 p-0"
      :class="{ 'btn-outline-light' : !file.error&& darkTheme, 'btn-outline-dark' : !file.error&& !darkTheme,'btn-outline-danger' : file.error }"
      v-for="file in files"
      :key="file.name"
      @click="onFileClick(file)"
      style="width: 100px; height: 100px;"
      :title="title(file, file.size)"
      @contextmenu="conextMenu(file, $event)"
    >
      <table class="w-100 h-100 align-middle text-center">
        <tr>
          <td>
            <IconFolder v-if="file.directory" class="icon-folder" :fontsize="40" />
            <IconFile v-else-if="!file.error" class="icon-file" :extension="getExt(file)" :fontsize="40" />
            <IconFileError v-else class="icon-file" :fontsize="40" />
          </td>
        </tr>
        <tr>
          <td class="text-truncate" style="max-width: 100px">
            {{ file.name }}
          </td>
        </tr>
      </table>
    </div>
    </div>
  </div>
</template>

<script>
import fs from 'fs'
import pathModule from 'path'
import { shell } from 'electron'
import { Menu, BrowserWindow, dialog } from '@electron/remote'
import { ref } from 'vue'

import IconFile from './IconFile.vue'
import IconFolder from './IconFolder.vue'
import IconFolderOpen from './IconFolderOpen.vue'
import IconFileError from './IconFileError.vue'

export default {
  emits: [
    'back',
    'folderclick',
    'changed'
  ],
  props: {
      files: {
          type: Array,
          default: () => []
      },
      checked:  Boolean,
      squareIcons: Boolean,
      darkTheme: Boolean,
  },
  components: {
      IconFile,
      IconFolder,
      IconFolderOpen,
      IconFileError,
  },
  methods: {
    fileSize({size}, checked) {
      if (!size) {
        return
      }
      let i
      if (!checked) {
        i = size ? Math.floor(Math.log(size) / Math.log(1024)) : size 
      } else {
        i = 0
      }
      
      return (
        (size / Math.pow(1024, i)).toFixed(2) * 1 + 
        " " +
        ['b', 'Kb', 'Mb', 'Gb', 'Tb'][i]
      )
    },
    onFileClick(file) {
      if (file.directory) this.$emit('folderclick', file)
      else {
        try {
          shell.openPath(pathModule.join(file.path, file.name))
        } catch (e) {
          console.log(e)
        }
      }
    },
    getExt(file) {
      return pathModule.extname(file.name)
    },
    title(file, size) {
      if (size) {
        return `${file.name}\n${this.fileSize(file, this.checked)}`
      }
      return file.name
    },
    conextMenu(file, event) {
      event.preventDefault()

      const template = ref([
        {
          label: 'Удалить',
          click: () => {
            if (file.directory) {
              this.deleteDir(file)
            } else {
              this.deleteFile(file)
            }
          }
        }
      ])

      const menu = Menu.buildFromTemplate(template.value)
      menu.popup(BrowserWindow.getFocusedWindow())
    },
    deleteDir(file) {
      try {
        if (file.name === "")
          return
        
        let slashes = ''
        if (!file.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }

        if(fs.existsSync(file.path + slashes + file.name)) {
          const conf = dialog.showMessageBoxSync({
            message: `Вы уверены, что хотите удалить эту папку и всё файлы внутри неё? (${file.path + slashes + file.name})`,
            buttons: [ "&Да", "&Отмена"],
            normalizeAccessKeys: true,
            title: "Удалить папку?"
          }) // ok - 0; cancel - 1
          if (conf) {
            return
          }
          fs.rmdirSync(file.path + slashes + file.name, { recursive: true })
          this.$emit('changed')
        } else {
          console.log(file.path + slashes + file.name)
          dialog.showMessageBox({ title: "Ошибка", message: "Такой папки не существует!" })
        }
      } catch (err) {
        console.log(err)
        dialog.showErrorBox("Ошибка", "Ошибка при удалении папки!\n" + err)
      }
    },
    deleteFile(file) {
      try {
        if (file.name === "")
          return

        let slashes = ''
        if (!file.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }

        if(fs.existsSync(file.path + slashes + file.name)) {
          const conf = dialog.showMessageBoxSync({
            message: `Вы уверены что хотите удалить этот файл? (${file.path + slashes + file.name})`,
            buttons: [ "&Да", "&Отмена"],
            normalizeAccessKeys: true,
            title: "Удалить файл?"
          }) // ok - 0; cancel - 1
          if (conf) {
            return
          }
          fs.unlinkSync(file.path + slashes + file.name)
          this.$emit('changed')
        }
      } catch (err) {
        console.log(err)
        dialog.showErrorBox("Ошибка", "Ошибка при удалении файла!\n" + err)
      }
    },
  }
}
</script>

<style scoped>
  .open {
    cursor: pointer;
    transition: transform .3s;
  }
  .open:hover {
    transform: scale(1.01, 1.01);
  }
</style>