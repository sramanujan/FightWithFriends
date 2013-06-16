currentSelectedUnit = null;
globalHeight = 900;
globalWidth = 1800;
globalUnitHeight = 100;
globalUnitWidth = 100;
globalTowerHeight = 200;
globalTowerWidth = 200;
globalProjectileHeight = 50;
globalProjectileWidth = 50;
globalLifeBarHeight = 10;

DrawableBar = function(size, color) {
    this.color = color;
    this.imageObj = mainScene.createElement(size, globalLifeBarHeight);
    this.imageObj.setOriginPoint("middle");
    this.imageObj.fillStyle = color;
    this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    this.setSize = function(size) {
        this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    }
}

DrawableObject = function(type, code, position, width, height, frames, parent) {
    this.code = code;
    switch(type) {
        case 'tower':
            this.finalHeight = globalTowerHeight;
            this.finalWidth = globalTowerWidth;
        break;
        case 'unit':
            this.finalHeight = globalUnitHeight;
            this.finalWidth = globalUnitWidth;
        break;
        case 'projectile':
            this.finalHeight = globalProjectileHeight;
            this.finalWidth = globalProjectileWidth;            
        break;
    }

    if(parent) {
        this.parent = parent;
    } else {
        this.parent = null;
    }

    this.framesPerSec = 24; //TODO: Hardcoding for now...
    this.frameWidth = width;
    this.frameHeight = height;
    this.totalFrames = frames;
    this.totalFramesX = (itemImages[this.code].width / width);
    this.totalFramesY = (itemImages[this.code].height / height);
    this.currentFrameX = 0;
    this.currentFrameY = 0;
    this.animTimer = null;

    this.imageObj =  mainScene.createElement(this.finalWidth, this.finalHeight);
    this.imageObj.drawImage(itemImages[this.code], this.currentFrameX * this.frameWidth, this.currentFrameY * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.finalWidth, this.finalHeight);    
    this.imageObj.setOriginPoint("middle");
    this.imageObj.x = position.x;
    this.imageObj.y = position.y;
    this.imageObj.tParent = this;
    mainScene.getStage().append(this.imageObj);

    this.remove = function() {
        this.imageObj.remove();
    }
    this.incrementPosition = function(position) {
        this.imageObj.x += position.x;
        this.imageObj.y += position.y;
    }
    this.incrementX = function(x) {
        this.imageObj.x += position.x;
    }
    this.incrementY = function(y) {
        this.imageObj.y += position.y;
    }
    this.setPosition = function(position) {
        this.imageObj.x = position.x;
        this.imageObj.y = position.y;
    }
    this.setX = function(x) {
        this.imageObj.x = position.x;
    }
    this.setY = function(y) {
        this.imageObj.y = position.y;
    }
    this.getPosition = function() {
        return {
            x: this.imageObj.x,
            y: this.imageObj.y
        };
    }
    this.getX = function() {
        return this.imageObj.x;        
    }
    this.getY = function() {
        return this.imageObj.y;
    }
    this.setOpacity = function(value) {
        this.imageObj.opacity = value;
    }
    this.getOpacity = function() {
        return this.imageObj.opacity;
    }
    this.addTouchAndClickListener = function(callback) {
        //TODO: check if its phone or web and add appropriate listener
        this.imageObj.on("mousedown", callback);
    }
    this.addDrawableElement = function(drawableElement) {
        this.imageObj.append(drawableElement.imageObj);
    }
    this.setRotation = function(value) {
        this.imageObj.rotation = value;
    }
    this.startAnimation = function(value) {
        if(!this.animTimer) {
            var thisObj = this;
            this.animTimer = setInterval(function() {
                thisObj.updateAnimation();
            }, 1000/this.framesPerSec);
        }
    }
    this.stopAnimation = function(value) {
        if(this.animTimer) {
            clearInterval(this.animTimer);
        }
        this.animTimer = null;
    }
    this.updateAnimation = function() {
        this.currentFrameX++;
        if(this.currentFrameX >= this.totalFramesX) {
            this.currentFrameY = (this.currentFrameY + 1) % this.totalFramesY;
            this.currentFrameX = 0;
        }
        if(this.currentFrameY * this.totalFramesX + this.currentFrameX >= this.totalFrames) {
            this.currentFrameX = 0;
            this.currentFrameY = 0;
        }
        this.imageObj.clearRect(0, 0, this.finalWidth, this.finalHeight);
        this.imageObj.drawImage(itemImages[this.code], this.currentFrameX * this.frameWidth, this.currentFrameY * this.frameHeight, this.frameWidth, this.frameHeight, 0, 0, this.finalWidth, this.finalHeight);
    }
}

GlobalGraphics = {};
GlobalGraphics.init = function(elementName) {
    canvasElementName = elementName;
    canvasDoc = document.getElementById('canvas1');

    canvas = CE.defines("canvas1").
    ready(function() {
        canvas.Scene.call("MainScene");
    });

    if(!runUpdateLoop) {
        runUpdateLoop = function() {};
    }

    mainScene = canvas.Scene.new({
        name: "MainScene",
        ready: function(stage) {
        },
        render: function(stage) {
            runUpdateLoop();
            stage.refresh();
        }
    });

    canvasDoc.onmousedown = function (event) {
        if (null != currentSelectedUnit) {
            currentSelectedUnit.mouseUp({x : event.offsetX, y : event.offsetY });
            currentSelectedUnit.drawableObject.setOpacity(currentSelectedUnit.drawableObject.getOpacity() < 1 ? 1 : 0.5);
            currentSelectedUnit = null;
        }
    }

/*
    canvasDoc.onmouseup = function (event) {
        if (null != currentSelectedUnit) {
            currentSelectedUnit.mouseUp({x : event.offsetX, y : event.offsetY });
            currentSelectedUnit.drawableObject.setOpacity(currentSelectedUnit.drawableObject.getOpacity() < 1 ? 1 : 0.5);
            currentSelectedUnit = null;
        }
    }
    */
}
GlobalGraphics.pauseRendering = function() {
    mcanvas = mainScene.getCanvas();
    mcanvas.clear();
    mainScene.pause(true);
}
GlobalGraphics.resumeRendering = function() {
    // un pause canvas - this starts the render loop
    mainScene.pause(false);
}
GlobalGraphics.resize = function() {
    mcanvas = mainScene.getCanvas();
    mcanvas.setSize("browser", "browser");
    globalWidth = canvasDoc.width;
    globalHeight = canvasDoc.height;
    globalUnitHeight = canvasDoc.height/10;
    globalUnitWidth = canvasDoc.width/20;
    globalTowerHeight = canvasDoc.height/5;
    globalTowerWidth = canvasDoc.width/10;
    globalProjectileHeight = canvasDoc.height/20;
    globalProjectileWidth = canvasDoc.width/40;
    globalLifeBarHeight = canvasDoc.height/100;
    TILE_BREADTH = canvasDoc.height/10;
    TILE_LENGTH = canvasDoc.width/20;
}
GlobalGraphics.loadKingdom = function(kingdom) {
    //var staticUnits = kingdom.buildings;
    var background = kingdom.theme.background;
    $('#' + canvasElementName).css('background', 'url(' + background + ')');
    //$('#canvas1').css('background-size', '100%');
    //background must be a URL
    //canvas.background.set("image('" + background + "'");
    //staticUnits is an array of units with each having an x and a y.
    /*
    for( var i = staticUnits.length - 1; i >= 0; i--) {
        loadStaticUnit(staticUnits[i]);
    }
    */
}