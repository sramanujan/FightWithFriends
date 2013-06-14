/**
 * Define models
 *
 * @param config
 * @param helpers
 */
var Position = function(x,y) {
	this.x = x;
	this.y = y;
}

Entity = function(code, data, ownerId, isAIControlled, isDefender, index) {
	this.code = code;
    this.data = data[code];
	this.health = data[code].health;
	this.maxHealth = data[code].health;
	this.range = data[code].range;
    this.targetTilePosition = {x: 1, y: 1};
    this.currentTilePosition = {x: 1, y: 1};
    this.currentAbsolutePosition = {x: 0, y: 0};
	this.enemy = null;
	this.ownerId = ownerId;
	this.isAIControlled = isAIControlled;
	this.isDefender = isDefender;
	this.index = index;
    this.lastMoved = new Date().getTime();
    this.state = "alive";
	
/*************** GRAPHICS *************/
    var imgObject = itemImages[this.code];
    var towerObj =  mainScene.createElement(globalTowerWidth, globalTowerHeight);
	towerObj.drawImage(imgObject, 0, 0, data[this.code].width, data[this.code].height, 0, 0, globalTowerWidth, globalTowerHeight);
	this.mapResource = towerObj;
	mainScene.getStage().append(this.mapResource);
	this.mapResource.cparent = this;
	if(this.ownerId == me.id) {
		this.mapResource.on("mousedown", function(e) {
		  this.cparent.mouseDown(e);
        });
	}
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
	}
/*************** GRAPHICS *************/    

  	this.update =function() {
        var time = new Date().getTime();

		if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}

		//If unit has reached its target position, update target to goal
        if(this.targetTilePosition.x == this.currentTilePosition.x && this.targetTilePosition.y == this.currentTilePosition.y && isAIControlled) {
            this.targetTilePosition.x = 14;
            this.targetTilePosition.y = 7;
		}
		if(!this.isAIControlled) {
			this.currentTilePosition = this.targetTilePosition;
		}
		else {
            var remX = this.targetTilePosition.x - this.currentTilePosition.x;
            var remY = this.targetTilePosition.y - this.currentTilePosition.y;

            var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
            var movableDist = this.data.tileSpeed * (time - this.lastMoved)/1000;

            var ratio;
            if(dist > 0) {
                if(dist > movableDist) {
                    ratio = movableDist/dist;
                } else {
                    ratio = 1;
                }
            } else {
                ratio = 0;
            }

            this.currentTilePosition.x += ratio * remX;
            this.currentTilePosition.y += ratio * remY;
		}

/*************** GRAPHICS *************/
        this.currentAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.currentTilePosition);
		this.mapResource.x = this.currentAbsolutePosition.x;
		this.mapResource.y = this.currentAbsolutePosition.y;
/*************** GRAPHICS *************/

        this.lastMoved = time;
  	};

 	this.parseInput =  function(functionName, params) {

 	};
  	this.updateEnemy =  function(entity) {

  	};

/*************** GRAPHICS *************/   
  	this.updateTargetAbsolute = function(position) {
        this.targetTilePosition = MAP_CONFIG.convertAbsoluteToTile(position);
  	};
/*************** GRAPHICS *************/

    this.updateTargetTile = function(position) {
        this.targetTilePosition = position;
    };

  	this.updatePosition =  function(position) {
  		this.currentTilePosition = position;
  	};

  	this.resolveBattle = function(entities) {
        var minDistance = 100000;
  		var nearestOpponent = null;
  		for(key in entities) {
  			var entity = entities[key];
  			if(key == this.index ) {
  				continue;
  			}
  			if(entity.state == "dead") {
  				continue;
  			}
  			if(entity.isDefender && this.isDefender) {
  				continue;
  			}
  			var remX = entity.currentTilePosition.x - this.currentTilePosition.x;
  			var remY = entity.currentTilePosition.y - this.currentTilePosition.y;
  			var dest = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
  			console.log("Total distance diff = "+dest);
  			if(dest < minDistance) {
  				minDistance = dest;
  				nearestOpponent = entity;
  			}
  		}
  		if(nearestOpponent != null) {
  			if(minDistance <= this.range) {
  				nearestOpponent.health -= 10;
  				if(nearestOpponent.health <= 0) {
  					nearestOpponent.state = "dead";
  				}
  			}
  		}
  	}
};

categories = { Attacker : 1, Defender : 2, Voyeur : 3 };

Player = function(name, id, numPlayersOnBoard) {
	this.name 	= name;
	this.id 	= id.toString();
	this.colorCode = numPlayersOnBoard;
	this.units = {};
	this.towers = {};
	this.projectiles = new Array();
	this.totalUnits = 0;
	this.totalTowers = 0;
	this.battle = {state:"planning", whoami : categories.Defender};
	
	this.addUnit = function(unit) {

/*************** GRAPHICS *************/        
		mainScene.getStage().append(unit.mapResource);
/*************** GRAPHICS *************/        

		console.log("add new unit " + unit.id);
		this.units[unit.id] = unit;
		this.totalUnits++;
	};

	this.addTower = function(tower) {

/*************** GRAPHICS *************/        
		mainScene.getStage().append(tower.mapResource);
/*************** GRAPHICS *************/        

		console.log("add new tower " + tower.id);
		this.towers[tower.id] = tower;
		this.totalTowers++;
	};

	this.towersOnBoard = function() {
		return this.totalTowers;
	};
	
	this.getUnits = function() {
		return this.units;
	};
	
	this.unitsOnBoard = function() {
		return this.totalUnits;
	};
	
	this.updatePosition = function(states) {
		var state = states;
		for(var key in state.units) {
			if (key != 'undefined') {
				if (null == this.units[key] || undefined == this.units[key] ) {

				}
				else {
					this.units[key].updateUnit(state, state.units[key]);
				}
			}
		}

		for(var key in state.towers) {
			if (key != 'undefined') {
				if (null == this.towers[key] || undefined == this.towers[key] ) {

				}
				else {
					this.towers[key].updateTower(state, state.towers[key]);
				}
			}
		}
	};

	this.update = function() {
		for(var key in this.units) {
			if (key != 'undefined') {
				this.units[key].update();
			}
		}
		for(var key in this.towers) {
			if (key != 'undefined')
				this.towers[key].update();
		}
		for(var i = this.projectiles.length - 1; i >= 0; i--) {
			if(this.projectiles[i].update() == false) {
				this.projectiles.splice(i,1);
			}
		}
	};
	
	this.getState = function() {
		unitPositions = {};
		if (this.battle.whoami == categories.Attacker) {
			for(var key in this.units) {
				if (key != 'undefined') {
					unitPositions[key] = this.units[key].getState();
				}
			}
		}
		towerPositions = {};
		if (this.battle.whoami == categories.Defender) {
			for(var key in this.towers) {
				if (key != 'undefined') {
					towerPositions[key] = this.towers[key].getState();
				}
			}
		}
		return {name : this.name, id : this.id, units : unitPositions, towers : towerPositions};
	};
	
	this.leaveRoom = function() {
		for(var key in this.units) {
			if (key != 'undefined') {

/*************** GRAPHICS *************/
				this.units[key].mapResource.remove();
/*************** GRAPHICS *************/                

				this.totalUnits--;
			}
		}
		for(var key in this.towers) {
			if (key != 'undefined') {

/*************** GRAPHICS *************/                
				this.towers[key].mapResource.remove();
/*************** GRAPHICS *************/                

				this.totalTowers--;
			}
		}
		this.units = {};
		this.towers = {};
	}
};

Projectile = function(owner, startPosition, targetRelativePosition, imgObject, projectileData) {
	this.projectileData = projectileData;


    this.drawableObject = new DrawableObject('projectile');

/*************** GRAPHICS *************/   
	var projectileObj =  mainScene.createElement(globalProjectileWidth, globalProjectileHeight);
    projectileObj.drawImage(imgObject, 0, 0, projectileData.width, projectileData.height, 0, 0, globalProjectileWidth, globalProjectileHeight);
    projectileObj.x = startPosition.x;
    projectileObj.y = startPosition.y;
    this.mapResource = projectileObj;
    mainScene.getStage().append(this.mapResource);

    this.drawableObject.init()
/*************** GRAPHICS *************/       

    this.targetRelativePosition = {x: targetRelativePosition.x, y: targetRelativePosition.y}
    this.hasHit = false;
	console.log("add new projectile ");
	this.owner = owner;
	this.owner.projectiles.push(this);

	this.update = function() {
/*************** GRAPHICS *************/           
		if(this && this.mapResource ) {
			var remX = (this.targetRelativePosition.x - (this.mapResource.x / canvasDoc.width));
			var remY = (this.targetRelativePosition.y - (this.mapResource.y / canvasDoc.height));
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(totalDist < 0.05) {
				this.hasHit = true;
				this.mapResource.remove();
				return false;
			} else if(this.projectileData.speed < totalDist) {
				this.mapResource.x += canvasDoc.width * remX * (this.projectileData.speed /  totalDist);
				this.mapResource.y += canvasDoc.height * remY * (this.projectileData.speed /  totalDist);	
				return true;
			} else {
				this.mapResource.x += canvasDoc.width * remX;
				this.mapResource.y += canvasDoc.height * remY;
				return true;
			}
		}
/*************** GRAPHICS *************/           
	}
}