<template>
  <div class="view">
    <b-jumbotron header="資料設定" lead="請設定BlogDB Path">
      <b-input-group class="mt-3">
        <b-form-input v-model="dir" readonly></b-form-input>
        <b-input-group-append>
          <b-button variant="primary" @click="browseFolder">選取</b-button>
        </b-input-group-append>
      </b-input-group>

      <hr>

      <b-form-input v-model.number="zoomFactor" @update="changeZoom" type="range" min="1" max="2" step="0.1"></b-form-input>

      <b-button variant="primary" href="#" @click="gosetDir">確定</b-button>
    </b-jumbotron>
  </div>
</template>

<style scoped>
.view {
  padding: 10px;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { remote, webFrame } from 'electron'
import { getBlogDBPath, setBlogDBPath } from '@/config/config'

@Component({
  components: {
  }
})
export default class AppConfig extends Vue {
  private dir = ''
  private zoomFactor = 1

  mounted () {
    this.dir = getBlogDBPath()
    this.zoomFactor = webFrame.getZoomFactor()
  }

  changeZoom () {
    webFrame.setZoomFactor(this.zoomFactor)
  }

  browseFolder () {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: ''
    }).then(resp => {
      if (resp.canceled) {
        return
      }
      this.dir = resp.filePaths[0]
    })
  }

  gosetDir () {
    setBlogDBPath(this.dir)
    webFrame.setZoomFactor(this.zoomFactor)

    this.$router.push({
      name: 'Home'
    })
  }
}
</script>
