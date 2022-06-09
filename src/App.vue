<template>
  {{ menuCreate() }}
  {{ getDiscs() }}
  
  <div
    class="container mt-2"
    @drop="dropFile($event)"
    @dragover="$event.preventDefault()"
    @dragleave="$event.preventDefault()"
    @dragend="$event.preventDefault()"
    dropzone="true"
  >

    <PathViewer
      :path="path"
      :discsfolder="discsFolder"
      :showPath="showPath"
      :darkTheme="darkTheme"
      @applyPath="applyPath($event)"
    />

    <AddFiles
      :path="path"
      :autoClose="autoClose"
      :darkTheme="darkTheme"
      @changed="updPath"
    />

    <div class="form-group mt-2 mb-2" style="color:aliceblue;">
      <input
        v-model="searchString"
        class="form-control form-sontrol-sm"
        placeholder="Поиск папки или файла"
      />
    </div>
    <FilesViewer
      :files="filteredFiles"
      :checked="inBytes"
      :darkTheme="darkTheme"
      :squareIcons="squareIcons"
      @back="back"
      @folderclick="open($event.name)"
      @changed="updPath"
      v-if="discsFolder"
    />
    <DisksViewer
      v-else
      :darkTheme="darkTheme"
      :discs="filteredDiscs()"
      :squareIcons="squareIcons"
      @folderclick="openNew($event)"
    />
  </div>
</template>

<script>
import fs from 'fs'
import pathModule from 'path'
import child from 'child_process'

import { app, Menu, shell } from '@electron/remote'
import { ref } from 'vue'

import FilesViewer from './components/FilesViewer.vue'
import DisksViewer from './components/DisksViewer.vue'
import PathViewer from './components/PathViewer.vue'
import AddFiles from './components/AddFiles.vue'

export default {
  components: {
    FilesViewer,
    DisksViewer,
    PathViewer,
    AddFiles,
  },
  data() {
    return {
      discsFolder: ref(true),
      path: ref(pathModule.dirname(pathModule.dirname(app.getAppPath()))),
      searchString: ref(''),
      inBytes: ref(false),
      autoClear: ref(true),
      autoClose: ref(true),
      squareIcons: ref(false),
      darkTheme: ref(true),
      showCheckboxes: ref(false),
      discs: ref([])
    }
  },
  methods: {
    back() {
      this.upd()
      if (this.path == pathModule.dirname(this.path)) {
        this.discsFolder = false
        this.getDiscs()
      }
      this.path = pathModule.dirname(this.path)
      
    },
    open(folder) {
      this.upd()
      this.path = pathModule.join(this.path, folder)
    },
    openNew(folder) {
      this.upd()
      this.getDiscs()
      this.path = ""
      this.path = pathModule.join(folder)
      this.discsFolder = true
    },
    applyPath(path) {
      if (this.autoClear) {
        this.searchString = ""
      }
      if (path !== pathModule.sep) {
        this.path = path
      } else {
        this.getDiscs()
        this.discsFolder = false
      }
    },
    upd() {
      if (this.autoClear) {
        this.searchString = ""
      }
    },
    updPath() {
      const bufPath = this.path
      this.path = ""
      this.path = bufPath
    },
    getDiscs() {
      this.discs = child.execSync('wmic logicaldisk get name').toString('utf8')
        .split('\r\r\n')
        .filter(value => /[A-Za-z]:/.test(value))
        .map(value => (value.trim() + pathModule.sep))
    },
    filteredDiscs() {
      const discs = this.discs
      const searchString = this.searchString
      return searchString
        ? discs.filter(s => s.toLowerCase().includes(searchString.toLowerCase()))
        : discs
    },
    setTheme(darkTheme) {
    this.darkTheme = darkTheme;
    if (this.darkTheme == false){
    document.body.style.backgroundColor = "white";
    let array = document.getElementsByClassName('btn');
    for (let i=0; i<array.length;i++){
       array[i].classList.remove('btn-outline-light');
       array[i].classList.add('btn-outline-dark');
    }
    } else
    {
    document.body.style.backgroundColor = "#25282b";
    let array = document.getElementsByClassName('btn');
    for (let i=0; i<array.length;i++){
       array[i].classList.remove('btn-outline-dark');
       array[i].classList.add('btn-outline-light');
    }
    }
    },
    menuCreate() {
      const template = [
        {
          label:'Настройки',
          submenu: [
            { role: 'forceReload',
              label: 'Перезагрузка проводника'
            },
            { role: 'toggleDevTools',
              label: 'Панель разработчика'
            },
          ]
        },
        {
          label: 'Вид',
          submenu: [
            {
              label: 'Квадратный вид',
              type: 'checkbox',
              checked: this.squareIcons,
              click: async (e) => {
                this.squareIcons = e.checked
              }
            },
            {
              label: 'Тёмная тема',
              type: 'checkbox',
              checked: this.darkTheme,
              click: async (e) => {
                this.darkTheme = e.checked;
                this.setTheme(this.darkTheme);
              }
            },
            {
              label: 'Показывать размер файлов в байтах',
              type: 'checkbox',
              checked: this.inBytes,
              click: async (e) => {
                this.inBytes = e.checked
              }
            },
            {
              label: 'Автозакрытие ввода',
              type: 'checkbox',
              checked: this.autoClose,
              click: async (e) => {
                this.autoClose = e.checked
              }
            },
            { type: 'separator' },
            { role: 'resetZoom',
              label: 'Стандартное приближение'
            },
            { role: 'zoomIn',
              label: 'Приблизить'
            },
            { role: 'zoomOut',
              label: 'Отдалить'
            },
            { type: 'separator' },
            
          ]
        },
        // { role: 'windowMenu' }
        {
          label: 'Окно',
          submenu: [
            { role: 'minimize',
              label: 'Свернуть окно'
            },
            { role: 'close',
                label: 'Закрыть окно'
            }
          ]
        },
        {
          role: 'help',
          label: 'Помощь',
          submenu: [
            {
              label: 'Узнать больше об Electron',
              click: async () => {
                await shell.openExternal('https://electronjs.org')
              }
            }
          ]
        }
      ]

      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
    },
    dropFile(e) {
      e.preventDefault();

      let slashes = ''
      if (!this.path.endsWith(pathModule.sep)) {
        slashes = pathModule.sep
      }

      for (let f of e.dataTransfer.files) {
        console.log(f.path, this.path + slashes + f.name)
        try {
          fs.copyFileSync(f.path, this.path + slashes + f.name)
          fs.unlinkSync(f.path)
          this.updPath()
        } catch (err) {
          console.log(err)
        }
      }
      
      return false;
    }
  },
  computed: {
    files() {
      try {
        const fileNames = fs.readdirSync(this.path)
        return fileNames.map(file => {
          try {
            var stats = fs.statSync(pathModule.join(this.path, file))
          } catch (e) {
            return {
              name: null,
              size: null,
              directory: null,
            }
          }
          
          return {
            name: file,
            size: stats.isFile() ? stats.size ?? 0 : null,
            directory: stats.isDirectory(),
            path: this.path
          }
        })
          .filter(x => x.name !== null)
          .sort((a, b) => {
          if (a.directory === b.directory) {
            return a.name.localeCompare(b.name)
          }
          return a.directory ? -1 : 1
        })
      } catch (e) {
        return [{
          name: e?.code + ": Нет прав для просмотра данной папки",
          size: 0,
          directory: 0,
          error: 1
        }]
      }
    },
    filteredFiles() {
      const searchString = this.searchString
      const files = this.files
      return searchString
        ? files.filter(s => s.name.toLowerCase().includes(searchString.toLowerCase()))
        : files
    }, 
  }
}
</script>