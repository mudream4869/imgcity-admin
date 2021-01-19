import { plainToClass } from 'class-transformer'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { getBlogDBPath } from '../config/config'

export class BlogMeta {
  title = ''
  datetime = new Date()
  filename = ''
}

export class Blog {
  meta = new BlogMeta()
  content = ''
}

export function getFullFilename (blogMeta: BlogMeta): string {
  const dt = blogMeta.datetime
  const YYYY = dt.getFullYear().toString()

  let MM = (dt.getMonth() + 1).toString()
  if (MM.length === 1) {
    MM = '0' + MM
  }

  let DD = dt.getDate().toString()
  if (DD.length === 1) {
    DD = '0' + DD
  }
  return YYYY + '/' + MM + '/' + DD + '/' + blogMeta.filename
}

const dbPath = getBlogDBPath()

let blogList: BlogMeta[] = []
let initBlogList = false

class BloglistFile {
  bloglist: BlogMeta[] = []
}

function loadBloglist (): BlogMeta[] {
  const listFilename = path.join(dbPath, 'blog.yaml')
  const cont = fs.readFileSync(listFilename, 'utf8')
  const data = yaml.safeLoad(cont)
  if (typeof data === 'undefined' || typeof data === 'string') {
    throw new Error('bloglist is invalid')
  }

  const bloglist = plainToClass(BloglistFile, data)
  if (bloglist.bloglist == null) {
    return []
  }

  return bloglist.bloglist
}

function commitBloglist () {
  const listFilename = path.join(dbPath, 'blog.yaml')

  const bloglist = new BloglistFile()
  bloglist.bloglist = blogList
  const opt = {
    sortKeys: true
  }
  fs.writeFileSync(listFilename, yaml.dump(bloglist, opt))
}

export function getBloglist (): BlogMeta[] {
  if (!initBlogList) {
    blogList = loadBloglist()
    initBlogList = true
  }
  return blogList
}

export function getBlog (year: number, month: number,
  day: number, filename: string): Blog | null {
  const YYYY = year.toString()
  let MM = month.toString()
  if (MM.length === 1) {
    MM = '0' + MM
  }

  let DD = day.toString()
  if (DD.length === 1) {
    DD = '0' + DD
  }

  const blogs = getBloglist()
  const blogMeta = new BlogMeta()
  blogs.forEach(b => {
    const dt = b.datetime
    if (b.filename === filename && dt.getFullYear() === year &&
        dt.getMonth() + 1 === month && dt.getDate() === day) {
      blogMeta.title = b.title
      blogMeta.datetime = new Date(b.datetime)
      blogMeta.filename = b.filename
    }
  })

  const fullFilename = path.join(dbPath, YYYY, MM, DD, filename, 'README.md')
  const content = fs.readFileSync(fullFilename, 'utf8')
  const blog = new Blog()
  blog.meta = blogMeta
  blog.content = content

  return blog
}

export function createBlog (filename: string, date: Date) {
  const blogMeta = new BlogMeta()
  blogMeta.datetime = date
  blogMeta.filename = filename
  const targetPath = path.join(dbPath, getFullFilename(blogMeta))
  fs.mkdirSync(targetPath, {
    recursive: true
  })

  blogList.push(blogMeta)
  commitBloglist()

  const fullFilename = path.join(dbPath, getFullFilename(blogMeta), 'README.md')
  fs.writeFileSync(fullFilename, '')
}

export function deleteBlog (blogMeta: BlogMeta) {
  const fullFilename = getFullFilename(blogMeta)
  const blogs = getBloglist()
  for (let i = 0; i < blogs.length; i++) {
    if (getFullFilename(blogs[i]) === fullFilename) {
      blogList.splice(i, 1)
      break
    }
  }

  commitBloglist()

  fs.rmdirSync(path.join(dbPath, fullFilename), {
    recursive: true
  })
}

export function saveBlog (fullBlog: Blog) {
  const fullFilename = getFullFilename(fullBlog.meta)
  const blogs = getBloglist()
  for (let i = 0; i < blogs.length; i++) {
    if (getFullFilename(blogs[i]) === fullFilename) {
      blogList[i].title = fullBlog.meta.title
      break
    }
  }

  commitBloglist()

  const contentFilename = path.join(dbPath, fullFilename, 'README.md')
  fs.writeFileSync(contentFilename, fullBlog.content)
}

export function listImage (blogMeta: BlogMeta): string[] {
  const fullFolder = path.join(dbPath, getFullFilename(blogMeta))

  const filenames: string[] = []
  fs.readdirSync(fullFolder).forEach(filename => {
    if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
      filenames.push(filename)
    }
  })

  return filenames
}

export function addImage (blogMeta: BlogMeta, imgPath: string, imgName: string) {
  const targetPath = path.join(dbPath, getFullFilename(blogMeta), imgName)
  fs.copyFileSync(imgPath, targetPath)
}

export function delImage (blogMeta: BlogMeta, imgName: string) {
  const fullPath = path.join(dbPath, getFullFilename(blogMeta), imgName)
  fs.unlinkSync(fullPath)
}
