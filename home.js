$(document).ready(function(){
    var canvas = $('#base-canvas');
    var context = canvas[0].getContext("2d");
    context.fillStyle = "blue";
    context.fillRect(0, 0, canvas.width(), canvas.height());
    var img = new Image();
    img.onload = function () {
        context.drawImage(img, 0, 0, canvas.width(), canvas.height());
        console.log("ImageRatios: "+ (img.width/img.height) + ", " + (canvas.width()/canvas.height()));
    }
    img.src = "images/download.jpg";
});