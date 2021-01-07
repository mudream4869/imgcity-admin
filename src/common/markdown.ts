function escape (text: string): string {
  return new Option(text).innerHTML
}

function inlineEscape (str: string): string {
  return str.replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)]\(([^(]+)\)/g, ('$1').link('$2'))
    .replace(/`([^`]+)`/g, (match, p1) => {
      return `<code>${escape(p1)}</code>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/ {2}\n/g, '<br />')
}

class MarkdownParam {
  splitter = / /
  isLine = false
  start = ''
  end = ''

  constructor (splitter: RegExp, isLine: boolean, start: string, end: string) {
    this.splitter = splitter
    this.isLine = isLine
    this.start = start
    this.end = end
  }

  process (line: string): string {
    return this.start + ('\n' + line)
      .split(this.splitter)
      .slice(1)
      .map(this.isLine ? escape : inlineEscape)
      .join(this.isLine ? '\n' : '</li>\n<li>') + this.end
  }
}

const mdParams: {[key: string]: MarkdownParam} = {
  '*': new MarkdownParam(/\n\* /, false, '<ul><li>', '</li></ul>'),
  '-': new MarkdownParam(/\n- /, false, '<ul><li>', '</li></ul>'),
  1: new MarkdownParam(/\n[1-9]\d*\.? /, false, '<ol><li>', '</li></ol>'),
  ' ': new MarkdownParam(/\n {4}/, true, '<pre><code>', '</pre></code>'),
  '>': new MarkdownParam(/\n> /, true, '<blockquote>', '</blockquote>')
}

export function markdownToHTML (src: string): string {
  let html = ''
  function escape (text: string): string {
    return new Option(text).innerHTML
  }

  function inlineEscape (str: string): string {
    return str.replace(/!\[([^\]]*)]\(([^(]+)\)/g, '<img alt="$1" src="$2" />')
      .replace(/\[([^\]]+)]\(([^(]+)\)/g, ('$1').link('$2'))
      .replace(/`([^`]+)`/g, (match, p1) => {
        return `<code>${escape(p1)}</code>`
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/ {2}\n/g, '<br />')
  }

  function processSemanticMarkdown (char: any, line: string): string {
    return (char === '#')
      ? ('<h' + (char = line.indexOf(' ')) + '>' + inlineEscape(line.slice(char + 1)) + '</h' + char + '>')
      : (char === '<' ? line : '<p>' + inlineEscape(line) + '</p>')
  }

  src.replace(/&gt;/g, '>').replace(/^\s+|\r|\s+$/g, '').replace(/\t/g, '    ').split(/\n\n+/).forEach((line: string): void => {
    const char = line[0]
    const prependType = mdParams[char]
    html += prependType ? prependType.process(line) : processSemanticMarkdown(char, line)
  })

  return html
}
