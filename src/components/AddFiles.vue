<template>
  <div class="mt-2 row">
    <div class="d-inline-flex">
      <button
        type="button"
        class="clickable btn m-1 ms-0 mt-0 col-md-auto"
        :class="{'btn-outline-light' : darkTheme, 'btn-outline-light': !darkTheme}"
        style="border-color:currentColor;"
        @click="typingName = !typingName"
      >
        <svg class="bi" width="24" height="24" fill="currentColor" >
          <use xlink:href="../assets/bootstrap-icons.svg#folder-plus"/>
        </svg>
        <span v-if="!typingName" class="ms-1 mt-0" style="color:currentColor;">Создать папку</span>
      </button>

      <input
        type="text"
        class="form-control m-1 mt-0 col-md-auto"
        v-if="typingName"
        style="width: 150px"
        @keypress.enter="createDir"
        v-model="folderName"
      />

      <button
        type="button"
        class="clickable btn m-1 ms-0 mt-0 col-md-auto"
        :class="{'btn-outline-light' : darkTheme, 'btn-outline-light': !darkTheme}"
        style="border-color:currentColor;"
        @click="typingDelete = !typingDelete"
      >
        <svg class="bi" width="24" height="24" fill="currentColor">
          <use xlink:href="../assets/bootstrap-icons.svg#folder-x"/>
        </svg>
        <span v-if="!typingDelete" class="ms-1 mt-0" style="color:currentColor;">Удалить папку</span>
      </button> 

      <input
        type="text"
        class="form-control m-1 mt-0 col-md-auto"
        v-if="typingDelete"
        style="width: 150px"
        @keypress.enter="deleteDir"
        v-model="deleteFolder"
      />
    
      <button
        type="button" 
        class="clickable btn m-1 ms-0 mt-0 col-md-auto"
        :class="{'btn-outline-light' : darkTheme, 'btn-outline-light': !darkTheme}"
        style="border-color:currentColor;"
        @click="typingFile = !typingFile"
      >
        <svg class="bi" width="24" height="24" fill="currentColor">
          <use xlink:href="../assets/bootstrap-icons.svg#file-earmark-plus"/>
        </svg>
        <span v-if="!typingFile" class="ms-1 mt-0" style="color:currentColor;">Создать файл</span>
      </button>

      <input
        type="text"
        class="form-control m-1 mt-0 col-md-auto"
        v-if="typingFile"
        style="width: 150px"
        @keypress.enter="createFile"
        v-model="fileName"
      />

      <button
        type="button" 
        class="clickable btn m-1 ms-0 mt-0 col-md-auto"
        :class="{'btn-outline-light' : darkTheme, 'btn-outline-light': !darkTheme}"
        style="border-color:currentColor;"
        @click="typingDelFile = !typingDelFile"
      >
        <svg class="bi" width="24" height="24" fill="currentColor">
          <use xlink:href="../assets/bootstrap-icons.svg#file-earmark-x"/>
        </svg>
        <span v-if="!typingDelFile" class="ms-1 mt-0" style="color:currentColor;">Удалить файл</span>
      </button>

      <input
        type="text"
        class="form-control m-1 mt-0 col-md-auto"
        v-if="typingDelFile"
        style="width: 150px"
        @keypress.enter="deleteFile"
        v-model="fileDelName"
      />
    </div>
  </div>
</template>

<script>
import fs from 'fs'
import pathModule from 'path'

import { ref } from 'vue'
import { dialog } from '@electron/remote'

export default {
  emits: [
    "changed",
    "dragFilesOut",
  ],
  data() {
    return {
      folderName: ref(''),
      typingName: ref(false),
      deleteFolder: ref(''),
      typingDelete: ref(false),
      fileName: ref(''),
      typingFile: ref(false),
      fileDelName: ref(''),
      typingDelFile: ref(false),
    }
  },
  props: {
    path: String,
    autoClose: Boolean,
  },
  methods: {
    createDir() {
      try {
        if (this.folderName === "")
          return
        
        let slashes = ''
        if (!this.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }
        if(!fs.existsSync(this.path + slashes + this.folderName)) {
          fs.mkdirSync(this.path + slashes + this.folderName)
          this.typingName = !this.autoClose
          this.$emit('changed')
        } else {
          dialog.showMessageBox({ title: "Ошибка", message: "Такая папка уже существует!"})
        }
      } catch (err) {
        console.log(err)
        dialog.showErrorBox("Ошибка", "Ошибка при создании папки!")
      }
    },
    deleteDir() {
      try {
        if (this.deleteFolder === "")
          return
        
        let slashes = ''
        if (!this.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }
        if(fs.existsSync(this.path + slashes + this.deleteFolder)) {
          const conf = dialog.showMessageBoxSync({
            message: `Вы уверены что хотите удалить эту папку и все файлы внутри неё? (${this.path + slashes + this.deleteFolder})`,
            buttons: [ "&Да", "&Отмена"],
            normalizeAccessKeys: true,
            title: "Удалить папку?"
          }) // ok - 0; cancel - 1
          if (conf) {
            return
          }
          fs.rmdirSync(this.path + slashes + this.deleteFolder, { recursive: true })
          this.typingDelete = !this.autoClose
          this.$emit('changed')
        } else {
          console.log(this.path + slashes + this.deleteFolder)
          dialog.showMessageBox({ title: "Ошибка", message: "Такой папки не существует!" })
        }
      } catch (err) {
        console.log(err)
        dialog.showErrorBox("Ошибка", "Ошибка удаления папки!\n" + err)
      }
    },
    createFile() {
      try {
        if (this.fileName === "")
          return

        let slashes = ''
        if (!this.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }

        fs.appendFileSync(this.path + slashes + this.fileName, "")
        this.typingFile = !this.autoClose
        this.$emit('changed')
      } catch (err) {
        console.log(err)
        dialog.showErrorBox("Ошибка", "Ошибка при создании файла!\n" + err)
      }
    },
    deleteFile() {
      try {
        if (this.fileDelName === "")
          return

        let slashes = ''
        if (!this.path.endsWith(pathModule.sep)) {
          slashes = pathModule.sep
        }

        if(fs.existsSync(this.path + slashes + this.deleteFolder)) {
          const conf = dialog.showMessageBoxSync({
            message: `Вы уверены что хотите удалить этот файл? (${this.path + slashes + this.fileDelName})`,
            buttons: [ "&Да", "&Отмена"],
            normalizeAccessKeys: true,
            title: "Удалить файл?"
          }) // ok - 0; cancel - 1
          if (conf) {
            return
          }
          fs.unlinkSync(this.path + slashes + this.fileDelName)
          this.typingDelFile = !this.autoClose
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