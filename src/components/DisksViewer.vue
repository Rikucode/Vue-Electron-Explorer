<template>
  <table class="table" v-if="!squareIcons">
    <tbody>
      <tr
        class="open clickable" 
        v-for="disc in discs"
        :key="disc"
        @click="onFileClick(disc)"
      >
        <td class="icon-row " style="color:aliceblue;" v-if="darkTheme">
            <IconDisc class="icon-folder"/>
        </td>
        <td class="icon-row " style="color:black;" v-else>
            <IconDisc class="icon-folder"/>
        </td>
        <td class="w-100  align-middle" style="color:aliceblue;" v-if="darkTheme">{{ disc }}</td>
        <td class="w-100  align-middle" style="color:black;" v-else>{{ disc }}</td>
      </tr>
    </tbody>
  </table>
  <div v-else
      class= "clickable d-inline-flex m-1 p-0 text-center justify-content-center"
      v-for="disc in discs"
      :key="disc"
      @click="onFileClick(disc)"
      style="width: 100px; height: 100px;"
      :title="disc"
    >
      <table v-if="darkTheme" class="w-100 h-100 align-middle text-center btn btn-outline-light" style="padding:5%; padding-left:25%; width:50%;">
        <tr>
          <td>
            <IconDisc class="icon-folder" :fontsize="45" />
          </td>
        </tr>
        <tr>
          <td class="text-truncate p-3" style="max-width: 100px">
            {{ disc }}
          </td>
        </tr>
      </table>
      <table v-else class="w-100 h-100 align-middle text-center btn btn-outline-dark" style="padding:5%; padding-left:25%; width:50%;">
        <tr>
          <td>
            <IconDisc class="icon-folder" :fontsize="45" />
          </td>
        </tr>
        <tr>
          <td class="text-truncate p-3" style="max-width: 100px">
            {{ disc }}
          </td>
        </tr>
      </table>
    </div>
</template>

<script>
import IconDisc from './IconDisc.vue'

export default {
  emits: [
    'folderclick',
  ],
  components: {
    IconDisc,
  },
  props: {
      discs: {
          type: Array,
          default: () => []
      },
      squareIcons: Boolean,
      darkTheme: Boolean,
      diskStyles: String,
  },
  methods: {
    onFileClick(disc) {
      this.$emit('folderclick', disc)
    }
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