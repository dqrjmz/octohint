import * as ts from 'typescript'
import './style.css'

const w = 7.223
const fileheadheight = 43
const gutterwidth = 60
const lineheight = 20
const CLASS_NAME = 'github-intellisense'

function getPosition(e: MouseEvent, $dom: HTMLElement) {
  const rect = $dom.getBoundingClientRect()
  // console.log(e.clientX, e.clientY, rect)
  return {
    x: Math.floor((e.clientX - rect.left - gutterwidth) / w),
    y: Math.floor((e.clientY - rect.top) / lineheight)
  }
}

// function visit(source, pos) {
// }

function check(node: any, pos: number, cb: any) {
  if (node.pos <= pos && pos < node.end) {
    console.log(node)
    if (node.kind === ts.SyntaxKind.Identifier) {
      return cb(node)
    }

    ts.forEachChild(node, n => check(n, pos, cb))
  }
}

function checkPromise(node: any, pos: number) {
  return new Promise(resolve => {
    check(node, pos, resolve)
  })
}

// Clear all
function clear() {
  document.querySelectorAll(`.${CLASS_NAME}`).forEach(($node: HTMLElement) => $node.remove())
}

function draw(range: any, width: number, className: string) {
  const $mask = document.createElement('div')

  // Set style
  $mask.className = `${CLASS_NAME} ${className}`
  $mask.style.width = `${width * w}px`
  $mask.style.top = `${range.line * 20 + fileheadheight}px`
  $mask.style.left = `${range.character * w + gutterwidth}px`

  // Append
  const $container = document.querySelector('.file-header')
  $container.appendChild($mask)
}

function drawDefinition(range: any, width: number) {
  return draw(range, width, 'github-intellisense-definition')
}

function drawUsage(range: any, width: number) {
  return draw(range, width, 'github-intellisense-usage')
}

function getCode(): string {
  const $dom = document.querySelector('table')
  if (!$dom) {
    return
  }
  return $dom.innerText
}

function main() {
  const $dom = document.querySelector('table')
  if (!$dom) {
    return
  }

  const code = $dom.innerText
  const source = ts.createSourceFile('index.js', code, ts.ScriptTarget.ES5)

  const lastIdentifier: any = null

  $dom.addEventListener('click', async function (e) {
    // If meta key is pressed, go to definition
    if (e.metaKey) {
      return
    }

    // Exclude click event triggered by selecting text
    // https://stackoverflow.com/questions/10390010/jquery-click-is-triggering-when-selecting-highlighting-text
    if (window.getSelection().toString()) {
      clear()
      return
    }

    const position = getPosition(e, $dom)
    const pos = source.getPositionOfLineAndCharacter(position.y, position.x)
    const identifier = await checkPromise(source, pos)

    // If identifier is the same as last one, do nothing
    if (identifier === lastIdentifier) {
      return
    }

    clear()

    // const range = source.getLineAndCharacterOfPosition(identifier.pos)
    // const width = identifier.end - identifier.pos
    // drawUsage(range, width)
  })
}

main()
