import { plainToClass } from 'class-transformer'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { getBlogDBPath } from '../config/config'

export class Blog {
  title = ''
  datetime = new Date()
  filename = ''

  content = ''
}

export function getFullFilename (blog: Blog): string {
  const dt = blog.datetime
  const YYYY = dt.getFullYear().toString()

  let MM = (dt.getMonth() + 1).toString()
  if (MM.length === 1) {
    MM = '0' + MM
  }

  let DD = dt.getDate().toString()
  if (DD.length === 1) {
    DD = '0' + DD
  }
  return YYYY + '/' + MM + '/' + DD + '/' + blog.filename
}

const dbPath = getBlogDBPath()

let blogList: Blog[] = []
let initBlogList = false

class BloglistFile {
  bloglist: Blog[] = []
}

function loadBloglist (): Blog[] {
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
  fs.writeFileSync(listFilename, yaml.dump(bloglist))
}

export function getBloglist (): Blog[] {
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
  const blog = new Blog()
  blogs.forEach(b => {
    const dt = b.datetime
    if (b.filename === filename && dt.getFullYear() === year &&
        dt.getMonth() + 1 === month && dt.getDate() === day) {
      blog.title = b.title
      blog.datetime = new Date(b.datetime)
      blog.filename = b.filename
    }
  })

  const fullFilename = path.join(dbPath, YYYY, MM, DD, filename, 'README.md')
  blog.content = fs.readFileSync(fullFilename, 'utf8')

  return blog
}

export function createBlog (filename: string, date: Date) {
  const blog = new Blog()
  blog.datetime = date
  blog.filename = filename
  const targetPath = path.join(dbPath, getFullFilename(blog))
  fs.mkdirSync(targetPath, {
    recursive: true
  })

  blogList.push(blog)
  commitBloglist()

  const fullFilename = path.join(dbPath, getFullFilename(blog), 'README.md')
  fs.writeFileSync(fullFilename, '')
}

export function deleteBlog (blog: Blog) {
  const fullFilename = getFullFilename(blog)
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

export function saveBlog (blog: Blog) {
  const blogs = getBloglist()
  for (let i = 0; i < blogs.length; i++) {
    if (getFullFilename(blogs[i]) === getFullFilename(blog)) {
      blogList[i].title = blog.title
      break
    }
  }

  commitBloglist()

  const fullFilename = path.join(dbPath, getFullFilename(blog), 'README.md')
  fs.writeFileSync(fullFilename, blog.content)
}

export function listImage (blog: Blog): string[] {
  const fullFolder = path.join(dbPath, getFullFilename(blog))

  const filenames: string[] = []
  fs.readdirSync(fullFolder).forEach(filename => {
    if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
      filenames.push(filename)
    }
  })

  return filenames
}

export function addImage (blog: Blog, imgPath: string, imgName: string) {
  const targetPath = path.join(dbPath, getFullFilename(blog), imgName)
  fs.copyFileSync(imgPath, targetPath)
}

export function delImage (blog: Blog, imgName: string) {
  const fullPath = path.join(dbPath, getFullFilename(blog), imgName)
  fs.unlinkSync(fullPath)
}
