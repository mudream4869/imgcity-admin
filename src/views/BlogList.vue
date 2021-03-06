<template>
  <div class="view">
    <b-modal id="mdl-create-blogpost" title="新增文章" @ok.prevent="createBlog">
      <b-form-group
        label="檔案"
        label-for="new-blog-filename"
        invalid-feedback="不可空檔名"
        :state="newBlogFilename.length > 0">
        <b-form-input id="new-blog-filename" placeholder="檔案名稱" v-model="newBlogFilename"></b-form-input>
      </b-form-group>

      <b-form-group
        label="日期"
        label-for="new-blog-date">
        <b-form-datepicker
          id="new-blog-date"
          class="mb-2"
          value-as-date
          v-model="newBlogDate"></b-form-datepicker>
      </b-form-group>
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
            <tr>
              <td>標題</td>
              <td>標籤</td>
              <td>日期</td>
              <td>檔案名稱 </td>
              <td>操作</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(blog, index) in showBlogList" v-bind:key="blog.datetime.toLocaleDateString() + blog.filename">
              <td>{{ blog.title }}</td>
              <td>
                <b-badge v-for="tag in blog.tags" v-bind:key="tag">
                    {{ tag }}
                </b-badge>
              </td>
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
import { getBloglist, BlogMeta, getFullFilename, createBlog, deleteBlog } from '../blog/blog'

@Component({
  components: {
  }
})
export default class BlogList extends Vue {
  private defaultHour = 16

  private blogs: BlogMeta[] = []

  private newBlogFilename = ''
  private newBlogDate = this.today()

  private selIndex: number | null = null

  today (): Date {
    const current = new Date()
    const year = current.getUTCFullYear()
    const month = current.getMonth()
    const date = current.getDate()
    return new Date(year, month, date, 0, 0, 0)
  }

  get showBlogList (): BlogMeta[] {
    const blogs = this.blogs
    blogs.sort((blog1, blog2) => {
      const dt1 = blog1.datetime
      const dt2 = blog2.datetime
      if (dt1 < dt2) {
        return 1
      } else if (dt1 > dt2) {
        return -1
      }
      return 0
    })
    return blogs
  }

  mounted () {
    this.blogs = getBloglist()
  }

  updated () {
    this.blogs = getBloglist()
  }

  getFullFilename (blog: BlogMeta): string {
    return getFullFilename(blog)
  }

  createBlog () {
    if (this.newBlogFilename.length === 0) {
      return
    }

    this.newBlogDate.setHours(this.defaultHour)

    createBlog(this.newBlogFilename, this.newBlogDate)

    this.newBlogDate = this.today()
    this.newBlogFilename = ''

    this.$nextTick(() => {
      this.$bvModal.hide('mdl-create-blogpost')
    })
  }

  deleteBlog () {
    if (this.selIndex === null) {
      return
    }
    deleteBlog(this.blogs[this.selIndex])
  }
}
</script>
