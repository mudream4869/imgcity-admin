import * as fs from 'fs'

export function getBlogDBPath (): string {
  try {
    return fs.readFileSync('path.conf', 'utf8')
  } catch {
    return 'blogdb'
  }
}

export function setBlogDBPath (p: string) {
  fs.writeFileSync('path.conf', p)
}
