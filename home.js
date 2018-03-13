const SEPARATION_THRESHOLD = 20;

class Pixel {

    constructor(x, y, cx, cy) {
        this.x = x;
        this.y = y;
        this.cx = cx;
        this.cy = cy;
    }

    nearTo(other_pixel) {
        if (Math.abs(this.cx - other_pixel.cx) <= SEPARATION_THRESHOLD && Math.abs(this.cy - other_pixel.cy) <= SEPARATION_THRESHOLD){
            return true;
        }
        else {
            console.log(Math.abs(this.cx - other_pixel.cx), Math.abs(this.cy - other_pixel.cy))
        }
        return false;
    }

}

class Annotation {
    
    constructor () {
        this.points = [];
        this.closed = false;
    }
    
}

function eventToPixel(canvas, event, fitting_ratio) {
    var rect = canvas.getBoundingClientRect();
    return new Pixel(Math.round((event.clientX - rect.x) / fitting_ratio), Math.round((event.clientY - rect.y) / fitting_ratio), (event.clientX - rect.x), (event.clientY - rect.y));
}

class DrawingBoard{
    
    constructor(img_canvas, drawing_canvas){
        this.img_canvas = img_canvas;
        this.drawing_canvas = drawing_canvas;
        this.StatesEnum = Object.freeze({'INACTIVE':0, 'DRAWING':1});
        this.state = this.StatesEnum.INACTIVE;
        this.img_fitting_ratio = 1;
        this.annotations = [];
        this.drawing_canvas[0].container = this;
        this.drawing_canvas[0].onmousedown = function(event) {
            this.container.mousedownCallback(event);
        }
    }

    loadImage(img_path) {
        var context = this.img_canvas[0].getContext("2d");
        context.fillStyle = "blue";
        context.fillRect(0, 0, this.img_canvas.width(), this.img_canvas.height());
        var img = new Image();
        img.container = this;
        img.onload = function(){
            this.container.loadImageCallback(context, img);  
        }
        img.src = img_path; 
    }

    loadImageCallback(context, img){
        if (this.img_canvas.width() / img.width > this.img_canvas.height() / img.height) {
            this.img_fitting_ratio = this.img_canvas.height() / img.height;
        }
        else {
            this.img_fitting_ratio = this.img_canvas.width() / img.width;
        }
        context.drawImage(img, 0, 0, Math.round(img.width * this.img_fitting_ratio), Math.round(img.height * this.img_fitting_ratio));
    }
    
    mousedownCallback(event){
        var pixel = eventToPixel(this.img_canvas[0], event, this.img_fitting_ratio);
        if (this.state == this.StatesEnum.INACTIVE){
            this.state = this.StatesEnum.DRAWING;
            var annotation = new Annotation();
            annotation.points.push(pixel);
            this.annotations.push(annotation);
        } else {
            var last_annotation = this.annotations[this.annotations.length - 1];
            var last_point_in_last_annotation = last_annotation.points[last_annotation.points.length - 1];
            if (pixel.nearTo(last_point_in_last_annotation)) {
                this.STATE = this.StatesEnum.INACTIVE;
                last_annotation.closed = true;
                console.log("closed an annotation")
            } else {
                last_annotation.points.push(pixel);
            }
        }
        this.drawAnnotations();
    }

    drawAnnotations(){
        for (var idx = 0; idx < this.annotations.length; idx++) {
            this.drawAnnotation(this.annotations[idx]);
        }
    }

    drawAnnotation(annotation) {
        var ctx = this.drawing_canvas[0].getContext('2d');
        ctx.clearRect(0, 0, this.drawing_canvas[0].width, this.drawing_canvas[0].height);  
        ctx.lineWidth = 1;
        ctx.strokeStyle="#FFFF00";
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(annotation.points[0].cx, annotation.points[0].cy, 10, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(annotation.points[0].cx, annotation.points[0].cy);
        for (var idx = 1; idx < annotation.points.length; idx++) {
            ctx.lineTo(annotation.points[idx].cx, annotation.points[idx].cy);
        }
        if (annotation.closed){
            ctx.closePath();
        }
        ctx.stroke();
    }
}

$(document).ready(function(){
    var img_canvas = $('#img-canvas');
    var drawing_canvas = $('#drawing-canvas');
    var drawing_board = new DrawingBoard(img_canvas, drawing_canvas);
    drawing_board.loadImage("images/download.jpg");

});