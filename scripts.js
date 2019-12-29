/* global FileReader, Image, Konva, Blob */
var imageForm = document.getElementById('imageForm')
var render = document.getElementById('render')
var imageLoader = document.getElementById('imageLoader')
var form = document.getElementById('form')
var container = document.getElementById('container')
var rows = document.getElementById('rows')
var columns = document.getElementById('columns')
var width = window.innerWidth
var height = window.innerHeight

// Initial widths can be as big as the screen
var gridWidth = width - 15
var gridHeight = height - 5

var yoda
var stage
var layer
var hlines
var vlines
var renderImage
var tr

form.addEventListener('submit', process)

function process (e) {
  e.preventDefault()
  form.classList.add('hide')
  imageForm.classList.add('active')

  // How many divisions will we use?
  var gw = columns.value
  var gh = rows.value

  // Calculate the increments we can use to make that many lines
  var hInc = Math.floor(gridWidth / gw + 1)
  var vInc = Math.floor(gridHeight / gh + 1)

  // Use the smaller increment size to keep the grid square and still fit
  if (hInc > vInc) hInc = vInc
  else vInc = hInc

  // Multiply it back out so we have the actual grid dimensions
  var gridMaxWidth = hInc * gw + 1
  var gridMaxHeight = vInc * gh + 1

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

  /* ************************************************************************ */

  /* Upload Image */
  imageLoader.addEventListener('change', handleImage, false)
  function handleImage (e) {
    var reader = new FileReader()
    reader.onload = function (event) {
      var img = new Image()
      img.onload = function () {
        yoda = new Konva.Image({
          x: 50,
          y: 50,
          name: 'yoda',
          image: img,
          width: 106,
          height: 118,
          draggable: true
        })
        container.classList.add('active')
        render.classList.add('active')
        imageForm.classList.remove('active')
        layer.add(yoda)
        yoda.moveToBottom()
        layer.batchDraw()
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(e.target.files[0])
  }

  stage.on('click tap', function (e) {
    if (e.target === stage) {
      stage.find('Transformer').destroy()
      layer.draw()
      return
    }
    if (!e.target.hasName('yoda')) {
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

  render.addEventListener('click', () => {
    var content = document.querySelector('.konvajs-content')
    var canvas = content.getElementsByTagName('canvas')[0]
    var ctx = canvas.getContext('2d')

    var renderCanvas = document.createElement('canvas')
    var renderCTX = canvas.getContext('2d')

    renderImage = new Konva.Image({
      x: 0,
      y: 0,
      name: 'render',
      image: renderCanvas,
      draggable: false
    })


    for (var i = hInc / 2; i < gridMaxWidth; i += hInc) {
      for (var j = hInc / 2; j < gridMaxHeight; j += vInc) {
        var c = ctx.getImageData(i, j, 1, 1).data
        renderCTX.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')'
        renderCTX.fillRect(i - hInc / 2, j - vInc / 2, hInc, vInc)
      }
    }

    tr.remove()
    yoda.remove()
    layer.add(renderImage)
    renderImage.moveToBottom()
    vlines.moveToTop()
    hlines.moveToTop()
    render.classList.remove('active')
    stage.off('click tap')
  })
}
