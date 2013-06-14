OBJECTS_ON_BOARD = {};
NUM_UNITS_ON_BOARD = 0;
GLOBAL_SELECTED_UNIT = null;

DrawableObject = function(code, tilePosition) {
    //defining abstract for extenders
    if(!this.beforeInit) this.beforeInit = function(code, tilePosition) {};
    if(!this.afterInit) this.afterInit = function(code, tilePosition) {};
    if(!this.beforeMoveTo) this.beforeMoveTo = function(absoluteX, absoluteY) {};
    if(!this.afterMoveTo) this.afterMoveTo = function(absoluteX, absoluteY) {};
    if(!this.beforePerformMove) this.beforePerformMove = function(time) {};
    if(!this.afterPerformMove) this.afterPerformMove = function(time) {};

    this.beforeInit(code, tilePosition);
    this.id = NUM_UNITS_ON_BOARD++;
    this.code = code;
    this.mesh = null;
    this.currentTilePosition = {
        x: tilePosition.x,
        y: tilePosition.y
    };
    this.targetTilePosition = {
        x: tilePosition.x,
        y: tilePosition.y
    };
    this.currentAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(tilePosition);

    this.moveTo = function ( absoluteX, absoluteY ) {
        this.beforeMoveTo();
        this.targetTilePosition = MAP_CONFIG.convertAbsoluteToTile({x: absoluteX, y: absoluteY});
        this.afterMoveTo();
    };

    this.performMove = function(time) {
        this.beforePerformMove();

        var maxTileMovement = this.data.speed * (time - this.lastMovedTime)/1000;

        var tileDist = Math.sqrt(Math.pow((this.targetTilePosition.x - this.currentTilePosition.x), 2) + Math.pow((this.targetTilePosition.y - this.currentTilePosition.y), 2));
        var ratio = 1;
        if(tileDist <= 0) {
            ratio = 0;
        } else if(tileDist > maxTileMovement) {
            ratio = maxTileMovement/tileDist;
        }

        this.currentTilePosition.x += (this.targetTilePosition.x - this.currentTilePosition.x) * ratio;
        this.currentTilePosition.y += (this.targetTilePosition.y - this.currentTilePosition.y) * ratio;
        this.currentAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.currentTilePosition);

        if(this.mesh) {
            this.mesh.position.set( this.currentAbsolutePosition.x, this.currentAbsolutePosition.y, 0);    
        }

        this.lastMovedTime = time;

        this.afterPerformMove();
    };

    this.lastMovedTime = new Date().getTime();
    this.afterInit(code, tilePosition);
}


//DrawableUnit.prototype = new DrawableObject(code, tilePosition);

function DrawableUnit(code, tilePosition){
    DrawableObject.apply( this, arguments );
}
DrawableUnit.prototype.beforeInit = function(code, tilePosition) {
    this.data = unit_data[code];
}
DrawableUnit.prototype.afterInit = function(code, tilePosition) {
    TILE_MAP[Math.floor(this.currentTilePosition.x)][Math.floor(this.currentTilePosition.y)] = this.id;

    new THREE.JSONLoader().load(this.data["3dobject"], drawableObjectJsonLoaded(this));

    this.healthBarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0, 20, 50, 50, 50, false), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    this.healthBarMesh.position.set( this.currentAbsolutePosition.x, this.currentAbsolutePosition.y, 200);
    this.healthBarMesh.rotation.x=3*Math.PI/2;

    this.lastFired = 0;

    SCENE.add(this.healthBarMesh);
};
DrawableUnit.prototype.beforePerformMove = function(time) {
    TILE_MAP[Math.floor(this.currentTilePosition.x)][Math.floor(this.currentTilePosition.y)] = false;    
};
DrawableUnit.prototype.afterPerformMove = function(time) {
    TILE_MAP[Math.floor(this.currentTilePosition.x)][Math.floor(this.currentTilePosition.y)] = this.id;

    if(this.healthBarMesh) {
        this.healthBarMesh.position.set( this.currentAbsolutePosition.x, this.currentAbsolutePosition.y, 200);
    }

    var enemyUnit = MAP_CONFIG.getEnemyUnitInRange(this.currentTilePosition);

    if(enemyUnit && (time - this.lastFired)/1000 > this.data.hitsPerSecond ) {
        this.lastFired = time;
        DrawableProjectile(this.data.projectileCode, this.currentAbsolutePosition, enemyUnit.currentAbsolutePosition);
    }    
};
DrawableUnit.prototype.beforeMoveTo = function(absoluteX, absoluteY) {
    //TODO: update server that a moveto was triggered...
    var var1 = 0;
};
DrawableUnit.prototype.updateHealth = function(value) {
    this.healthBarMesh.material.color.setRGB((1 - (value / this.data.health)), (value / unit_data[this.code].health), 0);
};


//DrawableProjectile.prototype = new DrawableObject(code, tilePosition);
function DrawableProjectile(code, tilePosition){
    DrawableObject.apply( this, arguments );
}
DrawableProjectile.prototype.beforeInit = function(code, tilePosition) {
    this.data = projectile_data[code];
}
DrawableProjectile.prototype.afterPerformMove = function(time) {
    if(this.currentAbsolutePosition.x == this.targetAbsolutePosition.x && this.currentAbsolutePosition.y == this.targetAbsolutePosition.y) {
        SCENE.remove(this.mesh);
        delete OBJECTS_ON_BOARD[this.id];
    }
}


function drawableObjectJsonLoaded(drawableObj) {
    return function(geometry, materials) {
        var zmesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0x0000ff}) );
        //var zmesh = new THREE.Mesh( geometry, materials[0] );
        zmesh.position.set( drawableObj.currentAbsolutePosition.x, drawableObj.currentAbsolutePosition.y, 0);
        zmesh.rotation.x=Math.PI/2;
        zmesh.scale.set( 1, 1, 1 );
        zmesh.overdraw = true;
        zmesh.drawableObj = drawableObj;
        SCENE.add( zmesh );
        OBJECTS_ON_BOARD[drawableObj.id] = drawableObj;
        drawableObj.mesh = zmesh;
    };
}