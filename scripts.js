function handleImage (e) {
  for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
    var file = e.originalEvent.srcElement.files[i];
    var reader = new FileReader();
    var img = new Image()
    reader.onloadend = function() {
      img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file);
  }
}

var imgupload = document.getElementById('imgupload')
var canvas = document.getElementById('canvas')
imgupload.addEventListener('change', handleImage)
