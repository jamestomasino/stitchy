function handleImage (e) {
  var reader = new FileReader()
  reader.onload = function (event) {
    var img = new Image()
    img.onload = function () {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(e.target.files[0])
}

var imgupload = document.getElementById('imgupload')
var canvas = document.getElementById('canvas')
imgupload.addEventListener('change', handleImage)
