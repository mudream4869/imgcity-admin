<template>
  <div>
    <b-modal id="mdl-upload-image" title="上傳圖片" @ok="addImage">
      <b-form-input v-model="newImgName" placeholder="檔案名稱"></b-form-input>
      <b-form-file
        v-model="selFile"
        accept="image/*"
        placeholder="Choose a file or drop it here..."
        drop-placeholder="Drop file here..."
        @input="setNewImgName"
      ></b-form-file>
    </b-modal>

    <b-modal id="mdl-show-image" :title="selImage">
      <img v-if="selImage != ''"
          :src="'image://' + getFullFilename(blog) + '/' + selImage"
          style="width:100%; height:100%;">
      <b-button variant="danger" @click="delImage">
        刪除
      </b-button>
    </b-modal>

    <b-navbar>
      <b-nav-form>
        <b-button variant="outline-info" :to="{path: '/blog/'}">
          離開
        </b-button>
      </b-nav-form>

      <b-nav-form>
        <b-input-group prepend="#">
          <b-form-input class="mr-sm-2" placeholder="標題" v-model="blog.title"></b-form-input>
        </b-input-group>
      </b-nav-form>

      <b-navbar-nav>
        <b-nav-item-dropdown text="圖片">
          <b-dropdown-item href="#"
            v-for="image in images"
            v-bind:key="image" v-on:click="selImage = image"
            v-b-modal.mdl-show-image>
            {{image}}</b-dropdown-item>
          <div class="dropdown-divider"></div>
          <b-dropdown-item href="#" v-b-modal.mdl-upload-image>上傳</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <b-nav-form right>
        <b-button variant="outline-success" :disabled="saving" v-on:click="save">
          <b-spinner small v-if="saving"></b-spinner>
          儲存
        </b-button>
        <b-button variant="outline-success" v-on:click="testMathjax">
          測試 MathJax
        </b-button>
      </b-nav-form>
    </b-navbar>

    <div id="editor">
      <textarea v-model="blog.content"></textarea>
      <div v-if="init" v-html="viewContent()"></div>
    </div>
  </div>
</template>

<style scoped>

#editor {
  width: 100%;
  height: calc(100% - 120px);
  position: absolute;
}

textarea, #editor div {
  display: inline-block;
  width: 50%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
  margin-top: 0px;
}

#editor div{
  overflow: auto;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}

</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Blog, getBlog, saveBlog, listImage, getFullFilename, addImage, delImage } from '../blog/blog'
import * as path from 'path'

// XXX
declare const MathJax: any
declare const marked: any
declare const hljs: any

marked.setOptions({
  highlight: function (code: string, lang: string): any {
    return hljs.highlight(lang, code).value
  }
})

document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block)
  })
})

@Component({
  components: {
  }
})
export default class BlogEdit extends Vue {
  private init = false
  private blog: Blog = new Blog()
  private saving = false
  private images: string[] = []
  private selImage = ''

  private selFile: File | null = null
  private newImgName = ''

  mounted () {
    const year = parseInt(this.$route.params.year)
    const month = parseInt(this.$route.params.month)
    const day = parseInt(this.$route.params.day)
    const filename = this.$route.params.filename

    const blog = getBlog(year, month, day, filename)
    if (blog === null) {
      return
    }
    this.blog = blog
    this.init = true

    this.images = listImage(this.blog)
  }

  save () {
    this.saving = true
    this.$forceUpdate()
    saveBlog(this.blog)
    this.saving = false
  }

  testMathjax () {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub])
  }

  viewContent (): string {
    return marked(this.blog.content).replace('src="',
      'style="width:100%;" src="image://' + getFullFilename(this.blog) + '/')
  }

  getFullFilename (blog: Blog): string {
    return getFullFilename(blog)
  }

  addImage () {
    if (this.selFile === null) {
      return
    }

    addImage(this.blog, this.selFile.path, this.newImgName)
    this.images.push(this.newImgName)

    this.selFile = null
    this.newImgName = ''
  }

  setNewImgName () {
    if (this.selFile === null) {
      return
    }

    this.newImgName = path.basename(this.selFile.path)
  }

  delImage () {
    delImage(this.blog, this.selImage)
    const imgID = this.images.indexOf(this.selImage)
    this.selImage = ''
    this.images.splice(imgID, 1)
    this.$bvModal.hide('mdl-show-image')
  }
}
</script>
