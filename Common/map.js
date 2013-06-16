TILE_BREADTH = 100;
TILE_LENGTH = 100;
NUM_TILES_LENGTH = 20;
NUM_TILES_BREADTH = 10;
TILE_MAP = new Array();
for( var i = 0; i < NUM_TILES_LENGTH; i++) {
    TILE_MAP.push(new Array());
    for( var j = 0; j < NUM_TILES_BREADTH; j++) {
        TILE_MAP[i].push(null);
    }
}
/*
var centerMesh = new THREE.MeshLambertMaterial({
    map:THREE.ImageUtils.loadTexture('assets/img/center.png')
});
var edgeMesh = new THREE.MeshLambertMaterial({
    map:THREE.ImageUtils.loadTexture('assets/img/edge.png')
});
var cornerMesh = new THREE.MeshLambertMaterial({
    map:THREE.ImageUtils.loadTexture('assets/img/corner.png')
});
*/
function loadMap(scene) {
    for( var i = 0; i < NUM_TILES_LENGTH; i++) {
        for( var j = 0; j < NUM_TILES_BREADTH; j++) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(TILE_LENGTH, TILE_BREADTH), MAP_CONFIG.getMesh(i,j));
            plane.position.x = (i * TILE_LENGTH) - (TILE_LENGTH * NUM_TILES_LENGTH/2);
            plane.position.y = (j * TILE_BREADTH) - (TILE_BREADTH * NUM_TILES_BREADTH/2);
            plane.rotation.z = MAP_CONFIG.getRotation(i,j);
            scene.add(plane);
            TILE_MAP[i][j] = null; //this should hold the object id of the unit on board.
        }
    }
}

MAP_CONFIG = {};
MAP_CONFIG.getMesh = function(i, j) {
    if( i == 0 || i == NUM_TILES_LENGTH - 1) {
        if( j == 0 || j == NUM_TILES_BREADTH - 1) {
            return cornerMesh
        } else {
            return edgeMesh;
        }
    } else if(j == 0 || j == NUM_TILES_BREADTH - 1) {
        return edgeMesh;   
    }
    return centerMesh;
};
MAP_CONFIG.getRotation = function(i, j) {
    if(i == 0) {
        if(j == 0) {
            return Math.PI/2;
        } else if(j == NUM_TILES_BREADTH - 1) {
            return 0;
        }
        return 0;
    } else if(i == NUM_TILES_LENGTH - 1) {
        if(j == 0) {
            return Math.PI;  
        } else if(j == NUM_TILES_BREADTH - 1) {
            return 3*Math.PI/2;
        } 
        return Math.PI;
    } else if(j == 0) {
        if(i == 0) {
            return Math.PI/2;
        } else if(i == NUM_TILES_LENGTH - 1) {
            return Math.PI;
        }
        return Math.PI/2;
    } else if(j == NUM_TILES_BREADTH - 1) {
        if(i == 0) {
            return 0;
        } else if(i == NUM_TILES_LENGTH - 1) {
            return 3*Math.PI/2;
        }
        return 3*Math.PI/2;
    }
    return 0;
};
MAP_CONFIG.convertTileToAbsolute = function(tilePosition) {
    return {
        x: TILE_LENGTH/2 + (tilePosition.x * TILE_LENGTH),// - (NUM_TILES_LENGTH * TILE_LENGTH)/2,
        y: TILE_BREADTH/2 + (tilePosition.y * TILE_BREADTH)// - (NUM_TILES_BREADTH * TILE_BREADTH)/2
    };
};
MAP_CONFIG.convertAbsoluteToTile = function(absolutePosition) {
    return {
        x: Math.floor(absolutePosition.x / TILE_LENGTH),//(absolutePosition.x + (NUM_TILES_LENGTH * TILE_LENGTH)/2 - TILE_LENGTH/2)/TILE_LENGTH,
        y: Math.floor(absolutePosition.y / TILE_BREADTH)//(absolutePosition.y + (NUM_TILES_BREADTH * TILE_BREADTH)/2 - TILE_BREADTH/2)/TILE_BREADTH
    };
};
MAP_CONFIG.getEnemyUnitInRange = function(tilePosition) {
    return null;
};
