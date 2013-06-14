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
    this.imageObj.fillStyle = color;
    this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    this.setSize = function(size) {
        this.imageObj.fillRect(0, 0, size, globalLifeBarHeight);
    }
}

DrawableObject = function(type, code, position, width, height, parent) {
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
    this.imageObj.drawImage(itemImages[this.code], 0, 0, width, height, 0, 0, finalWidth, finalHeight);
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

    canvasDoc.onmouseup = function (event) {
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