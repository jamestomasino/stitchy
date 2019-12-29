/* global FileReader, Image, Konva, Blob */
var imageLoader = document.getElementById('imageLoader')
var imageInput = document.getElementById('imageInput')
var container = document.getElementById('container')
var width = window.innerWidth
var height = window.innerHeight

// Initial widths can be as big as the screen
var gridWidth = width - 15
var gridHeight = height - 5

// How many divisions will we use?
var gw = 57
var gh = 65

// Calculate the increments we can use to make that many lines
var hInc = Math.floor(gridWidth / gw + 1)
var vInc = Math.floor(gridHeight / gh + 1)

// Use the smaller increment size to keep the grid square and still fit
if (hInc > vInc) hInc = vInc
else vInc = hInc

// Multiply it back out so we have the actual grid dimensions
var gridMaxWidth = hInc * gw + 1
var gridMaxHeight = vInc * gh + 1

var stage = new Konva.Stage({
  container: 'container',
  width: gridMaxWidth + 1,
  height: gridMaxHeight + 1
})

var layer = new Konva.Layer()
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
var vlines = new Konva.Line({
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
var hlines = new Konva.Line({
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
      var yoda = new Konva.Image({
        x: 50,
        y: 50,
        name: 'yoda',
        image: img,
        width: 106,
        height: 118,
        draggable: true
      })
      imageInput.classList.add('hide')
      container.classList.add('active')
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
  var tr = new Konva.Transformer({
    node: e.target,
    keepRatio: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
  })
  layer.add(tr)
  layer.draw()
})

