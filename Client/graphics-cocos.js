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

DrawableBar = function(code, size, maxSize, color) {
    this.color = color;
    this.maxSize = maxSize;
    this.imageObj = mainScene.createElement(size, globalLifeBarHeight);

    //this.imageObj =  mainScene.createElement(finalWidth, finalHeight);
    this.imageObj.drawImage(itemImages[code], 0, 0, 400, 100, 0, 0, size, globalLifeBarHeight);


    //this.imageObj.setOriginPoint("middle");
    //this.imageObj.fillStyle = color;
    //this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    this.setSize = function(size) {
        this.imageObj.scaleX = size/maxSize;
        //this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    }
}

DrawableObject = function(type, code, position, width, height, frames, parent) {
    this.code = code;
    var finalWidth;
    var finalHeight;
    switch(type) {
        case 'tower':
            finalHeight = globalTowerHeight;
            finalWidth = globalTowerWidth;
        break;
        case 'unit':
            finalHeight = globalUnitHeight;
            finalWidth = globalUnitWidth;
        break;
        case 'projectile':
            finalHeight = globalProjectileHeight;
            finalWidth = globalProjectileWidth;            
        break;
    }

    if(parent) {
        this.parent = parent;
    } else {
        this.parent = null;
    }

    this.imageObj =  mainScene.createElement(finalWidth, finalHeight);
    this.imageObj.scaleX = (finalWidth/width);
    this.imageObj.scaleY = (finalHeight/height);
    this.animationName = "_default";
    this.animation = canvas.Animation.new({
        images: itemImages[this.code],
        animations: {
            _default: {
                frames: [0, frames-2],
                size: {
                    width: width,
                    height: height
                },
                frequence: 3
            }
        }
    });

    this.animation.add(this.imageObj);
    this.animation.play(this.animationName);

    //this.imageObj.drawImage(itemImages[this.code], 0, 0, width, height, 0, 0, finalWidth, finalHeight);
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
    this.playAnimation = function() {
        this.animation.play(this.animationName);
    }
    this.stopAnimation = function() {
        this.animation.stop();  
    }
}

GlobalGraphics = {};
GlobalGraphics.init = function(elementName) {
    canvasElementName = elementName;
    canvasDoc = document.getElementById('canvas1');

    canvas = CE.defines("canvas1").
    extend(Animation).
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
GlobalGraphics.resize = function(width, height) {
    //mcanvas = mainScene.getCanvas();
    //mcanvas.setSize("browser", "browser");
    globalWidth = width;
    globalHeight = height;
    globalUnitHeight = height/10;
    globalUnitWidth = width/20;
    globalTowerHeight = height/5;
    globalTowerWidth = width/10;
    globalProjectileHeight = height/20;
    globalProjectileWidth = width/40;
    globalLifeBarHeight = height/100;
    TILE_BREADTH = height/10;
    TILE_LENGTH = width/20;
}
GlobalGraphics.loadKingdom = function(kingdom) {
//TODO: FIX THIS BACKGROUND!!!
    //var background = kingdom.theme.background;
    //$('#' + canvasElementName).css('background', 'url(' + background + ')');
}