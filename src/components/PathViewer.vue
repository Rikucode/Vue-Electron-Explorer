<template>
  <h4 style="min-height: 40px;">
    <div class="overflow-fill">
          <div  
            class="d-inline-flex me-1 mt-1"
            v-for="p, index in customPath"
            :key="p"
          >
            <div
              class="d-flex align-middle btn-outline-light btn"
              @click="goPath(index)"
            >
              {{ p }}
              <svg class="bi" width="16" height="16" fill="currentcolor"  v-if="index !== customPath.length - 1">
                <use xlink:href="../assets/bootstrap-icons.svg#caret-right-fill"/>
              </svg>
            </div>  
          </div>
    </div>
  </h4>
</template>

<script>
import pathModule from 'path'

export default {
  emits: [
    'applyPath',
  ],
  props: {
    path: String,
    discsfolder: Boolean,
    showPath: Boolean
  },
  methods: {
    goPath(index) {
      this.$emit('applyPath', this.path.split(pathModule.sep).slice(0,index).join(pathModule.sep) + pathModule.sep)
    }
  },
  computed: {
    customPath() {
      if (!this.discsfolder) {
        return ['This PC']
      }

      const newPath = "This PC" + pathModule.sep + this.path
      return newPath.split(pathModule.sep).filter(x => x !== "")
    }
  }
}
</script>

<style scoped>
  .bi {
    position: relative;
    font-size: calc(1rem + .3vw);
    top: 5px
  }
</style>