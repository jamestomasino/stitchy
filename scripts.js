/* global FileReader, Image, Konva, ColorThief, nearestColor */
var imageForm = document.getElementById('imageForm')
var render = document.getElementById('render')
var imageLoader = document.getElementById('imageLoader')
var form = document.getElementById('form')
var flex = document.getElementById('flex')
var container = document.getElementById('container')
var rows = document.getElementById('rows')
var columns = document.getElementById('columns')
var colorsInput = document.getElementById('colors')

var pattern // Uploaded image
var stage // Konva canvas container
var layer // Konva canvas layer
var hlines // number of horizontal lines
var vlines // number of vertical lines
var tr // transform handle
var hInc // horizontal line pixel increment
var vInc // vertical line pixel increment
var width // screen width
var height // screen height
var gridWidth // grid width init before fitting to container
var gridHeight // grid height init before fitting to container
var gridMaxWidth // total width of the grid in pixels
var gridMaxHeight // total height of the grid in pixels
const colorThief = new ColorThief()
var colors // total number of colors to extract from pattern
var palette // color palette of pattern
var getColor // nearest color calculator

form.addEventListener('submit', process)

function process (e) {
  e.preventDefault()
  calculateGrid()
  initializeStage()
  bindImageUpload()
  bindTransform()
  bindRenderButton()
}

function calculateGrid () {
  form.classList.add('hide')
  imageForm.classList.add('active')

  // Initial dimensions can be as big as the screen(-ish)
  width = window.innerWidth
  height = window.innerHeight
  gridWidth = width - 15
  gridHeight = height - 5

  // How many divisions will we use?
  var gw = parseInt(columns.value, 10)
  var gh = parseInt(rows.value, 10)
  colors = parseInt(colorsInput.value, 10)

  // Calculate the increments we can use to make that many lines
  hInc = Math.floor(gridWidth / gw)
  vInc = Math.floor(gridHeight / gh)

  // Use the smaller increment size to keep the grid square and still fit
  if (hInc > vInc) hInc = vInc
  else vInc = hInc

  // Multiply it back out so we have the actual grid dimensions
  gridMaxWidth = hInc * gw
  gridMaxHeight = vInc * gh
}

function initializeStage () {
  stage = new Konva.Stage({
    container: 'container',
    width: gridMaxWidth + 1,
    height: gridMaxHeight + 1
  })

  layer = new Konva.Layer()
  stage.add(layer)
  layer.draw()

  // Draw all the lines across the horizontal axis
  var hArray = []
  for (var i = 1; i <= gridMaxWidth; i += hInc) {
    hArray.push(i, 1)
    hArray.push(i, gridMaxHeight - 1)
    hArray.push(i, 1)
  }

  // Draw all the lines across the vertical axis
  vlines = new Konva.Line({
    points: hArray,
    stroke: 'blue',
    strokeWidth: 0.1,
    lineCap: 'round',
    lineJoin: 'round'
  })

  var vArray = []
  for (i = 1; i <= gridMaxHeight; i += vInc) {
    vArray.push(1, i)
    vArray.push(gridMaxWidth - 1, i)
    vArray.push(1, i)
  }
  hlines = new Konva.Line({
    points: vArray,
    stroke: 'blue',
    strokeWidth: 0.1,
    lineCap: 'round',
    lineJoin: 'round'
  })

  layer.add(vlines)
  layer.add(hlines)
}

function bindImageUpload () {
  /* Upload Image */
  imageLoader.addEventListener('change', handleImage, false)
  function handleImage (e) {
    var reader = new FileReader()
    reader.onload = function (event) {
      var img = new Image()
      img.onload = function () {
        pattern = new Konva.Image({
          x: 50,
          y: 50,
          name: 'pattern',
          image: img,
          width: 106,
          height: 118,
          draggable: true
        })
        container.classList.add('active')
        render.classList.add('active')
        imageForm.classList.remove('active')
        layer.add(pattern)
        pattern.moveToBottom()
        layer.batchDraw()
        palette = colorThief.getPalette(img, colors)
        var rgbpalette = palette.map(x => rgbToHex(x[0], x[1], x[2]))
        rgbpalette.push('#fff') // force add white for backgrounds
        getColor = nearestColor.from(rgbpalette)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(e.target.files[0])
  }
}

function bindTransform () {
  stage.on('click tap', function (e) {
    if (e.target === stage) {
      stage.find('Transformer').destroy()
      layer.draw()
      return
    }
    if (!e.target.hasName('pattern')) {
      return
    }
    stage.find('Transformer').destroy()
    tr = new Konva.Transformer({
      node: e.target,
      keepRatio: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    })
    layer.add(tr)
    layer.draw()
  })
}

function bindRenderButton () {
  render.addEventListener('click', () => {
    // Get reference to raw canvas object in Konva
    var content = document.querySelector('.konvajs-content')
    var canvas = content.getElementsByTagName('canvas')[0]
    var ctx = canvas.getContext('2d')

    // Create new canvas object for flat output render
    var renderCanvas = document.createElement('canvas')
    var renderCTX = renderCanvas.getContext('2d')
    renderCanvas.width = gridMaxWidth
    renderCanvas.height = gridMaxHeight
    renderCTX.fillStyle = 'white'
    renderCTX.fillRect(0, 0, renderCanvas.width, renderCanvas.height)
    flex.appendChild(renderCanvas)

    // Loop through grid at midpoints of quares
    for (var i = 1; i < gridMaxWidth; i += hInc) {
      for (var j = 1; j < gridMaxHeight; j += vInc) {
        let R = 0
        let G = 0
        let B = 0
        let A = 0
        const data = ctx.getImageData(i, j, hInc, vInc).data
        const components = data.length
        for (let i = 0; i < components; i += 4) {
          // A single pixel (R, G, B, A) will take 4 positions in the array:
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          R += r
          G += g
          B += b
          A += a
        }
        const pixelsPerChannel = components / 4
        R = R / pixelsPerChannel | 0
        G = G / pixelsPerChannel | 0
        B = B / pixelsPerChannel | 0
        A = A / pixelsPerChannel / 255
        // flatten RGBA colors to RGB to prep for nearest-neighbor calc
        var rgb = rgba2rgb(R, G, B, A)
        var hex = getColor(rgbToHex(rgb[0], rgb[1], rgb[2]))
        console.log(hex)
        // Fill square in output canvas with captured color
        renderCTX.fillStyle = hex
        renderCTX.fillRect(i, j, hInc, vInc)
      }
    }

    // Draw vertical grid lines on top
    for (i = 1; i <= gridMaxWidth; i += hInc) {
      renderCTX.beginPath()
      renderCTX.moveTo(i, 1)
      renderCTX.lineTo(i, gridMaxHeight)
      ctx.strokeStyle = '#33FF33'
      renderCTX.stroke()
    }

    // Draw horizontal grid lines on top
    for (i = 1; i <= gridMaxHeight; i += vInc) {
      renderCTX.beginPath()
      renderCTX.moveTo(1, i)
      renderCTX.lineTo(gridMaxWidth, i)
      ctx.strokeStyle = '#33FF33'
      renderCTX.stroke()
    }

    // Destroy Konva canvas
    stage.destroy()
    // Remove render button
    render.classList.remove('active')
    // Unbind click handler on stage
    stage.off('click tap')
  })
}

function rgba2rgb (r, g, b, a) {
  return [
    Math.round((1 - a) * 255 + a * r),
    Math.round((1 - a) * 255 + a * g),
    Math.round((1 - a) * 255 + a * b)
  ]
}

function rgbToHex (r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}
