/* global FileReader, Image, Konva, Blob */
var imageLoader = document.getElementById('imageLoader')
var imageInput = document.getElementById('imageInput')
var container = document.getElementById('container')
var width = window.innerWidth
var height = window.innerHeight

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height
})

var layer = new Konva.Layer()
stage.add(layer)
layer.draw()

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

var gridWidth = width - 15
var gridHeight = height - 5

var gw = 10
var gh = 15

var hInc = Math.floor(gridWidth / gw + 1)
var gridMaxWidth = hInc * gw + 1
var vInc = Math.floor(gridHeight / gh + 1)
var gridMaxHeight = vInc * gh + 1

var hArray = []
for (var i = 1; i <= gridMaxWidth; i += hInc) {
  hArray.push(i, 1)
  hArray.push(i, gridMaxHeight - 1)
  hArray.push(i, 1)
}
var vlines = new Konva.Line({
  points: hArray,
  stroke: 'white',
  strokeWidth: 1,
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
  stroke: 'white',
  strokeWidth: 1,
  lineCap: 'round',
  lineJoin: 'round'
})

layer.add(vlines)
layer.add(hlines)
