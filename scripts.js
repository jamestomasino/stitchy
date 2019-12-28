/* global FileReader, Image, Konva */
var imageLoader = document.getElementById('imageLoader')
var imageInput = document.getElementById('imageInput')
var container = document.getElementById('container')

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
      layer.draw()
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}

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

stage.on('click tap', function (e) {
  if (e.target === stage) {
    stage.find('Transformer').destroy()
    layer.draw()
    return
  }
  if (!e.target.hasName('yoda')) {
    console.log(e.target)
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
