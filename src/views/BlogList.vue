<template>
  <div class="view">
    <b-modal id="mdl-create-blogpost" title="新增文章" @ok="createBlog">
      <b-form-input placeholder="檔案名稱" v-model="newBlogFilename"></b-form-input>
      <b-form-datepicker
        class="mb-2"
        value-as-date
        v-model="newBlogDate"></b-form-datepicker>
    </b-modal>

    <b-modal
      header-bg-variant="danger"
      id="mdl-remove-blogpost"
      title="刪除文章"
      @ok="deleteBlog">
      警告：此操作將無法還原。
    </b-modal>

    <div class="row">
      <div class="col-md-12">
        <b-button v-b-modal.mdl-create-blogpost>新增文章</b-button>
        <table class="table">
          <thead>
            <tr><td>標題</td> <td>日期</td> <td>檔案名稱</td> <td>操作</td></tr>
          </thead>
          <tbody>
            <tr v-for="(blog, index) in blogs" v-bind:key="blog.datetime.toLocaleDateString() + blog.filename">
              <td>{{ blog.title }}</td>
              <td>{{ blog.datetime.toLocaleDateString() }}</td>
              <td>{{ blog.filename }}</td>
              <td>
                <b-button-group>
                  <b-button variant="outline-primary"
                            :to="{path: '/blog/' + getFullFilename(blog) }">
                    編輯
                  </b-button>
                  <b-button
                    @click="selIndex = index"
                    variant="danger"
                    v-b-modal.mdl-remove-blogpost>刪除</b-button>
                </b-button-group>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
  </div>
</template>

<style scoped>
.view {
  padding: 10px;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getBloglist, Blog, getFullFilename, createBlog, deleteBlog } from '../blog/blog'

@Component({
  components: {
  }
})
export default class BlogList extends Vue {
  private blogs: Blog[] = []

  private newBlogFilename = ''
  private newBlogDate = new Date()

  private selIndex: number | null = null

  mounted () {
    this.blogs = getBloglist()
  }

  updated () {
    this.blogs = getBloglist()
  }

  getFullFilename (blog: Blog): string {
    return getFullFilename(blog)
  }

  createBlog () {
    createBlog(this.newBlogFilename, this.newBlogDate)
    this.newBlogDate = new Date()
    this.newBlogFilename = ''
  }

  deleteBlog () {
    if (this.selIndex === null) {
      return
    }
    deleteBlog(this.blogs[this.selIndex])
  }
}
</script>
