currentSelectedUnit = null;
globalHeight = 900;
globalWidth = 1800;
globalUnitHeight = 100;
globalUnitWidth = 100;
globalTowerHeight = 200;
globalTowerWidth = 200;
globalProjectileHeight = 50;
globalProjectileWidth = 50;

DrawableObject = function(type, position, width, height, imgObject) {
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

    this.imageObj =  mainScene.createElement(finalWidth, finalHeight);
    this.imageObj.drawImage(imgObject, 0, 0, width, height, 0, 0, finalWidth, finalHeight);
    this.imageObj.x = position.x;
    this.imageObj.y = position.y;
    //this.mapResource = imageObj;
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
            currentSelectedUnit.mapResource.opacity = currentSelectedUnit.mapResource.opacity < 1 ? 1 : 0.5 ;
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