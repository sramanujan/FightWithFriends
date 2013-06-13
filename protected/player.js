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
    	this.health = data[code].health;
    	this.maxHealth = data[code].health;
    	this.range = data[code].range;
   	 	var position = new Position(0.10,0.10);
   	 	var targetPosition = new Position(0.2, 0.3);
    	this.targetPosition = targetPosition;
    	this.currentPosition = position;
    	this.enemy = null;
    	this.ownerId = ownerId;
    	this.isAIControlled = isAIControlled;
    	this.isDefender = isDefender;
    	this.index = index;
    	this.speed = 0.002;
    	//this.speed = 
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
		this.state = "alive";

		this.mouseDown = function(event) {
			currentSelectedUnit = this;
			this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		}

  	this.update =function() {
  		
  		/*if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}

		var relativeSpeed = this.speed;
		//If unit has reached its target position, update target to goal
		if(this.targetPosition.x == this.currentPosition.x && this.targetPosition.y == this.currentPosition.y && this.isAIControlled) {

			// shud also move around towers?
			this.targetPosition.x = 0.85;
			this.targetPosition.y = 0.85;

			relativeSpeed = relativeSpeed * 0.35;
		}
		if(!this.isAIControlled) {
			this.currentPosition = this.targetPosition;
		}
		else {
			var remX = this.targetPosition.x - this.currentPosition.x;
			var remY = this.targetPosition.y - this.currentPosition.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));

			if(dist > this.speed) {
				this.currentPosition.x += (remX / dist)*relativeSpeed;
				this.currentPosition.y += (remY / dist)*relativeSpeed;
			} else {
				this.currentPosition.x += remX;
				this.currentPosition.y += remY;
			}
		}		
		this.mapResource.x = this.currentPosition.x * canvasDoc.width;
		this.mapResource.y = this.currentPosition.y * canvasDoc.height;*/

			if(this.state == "dead") {
				this.mapResource.remove();
				return false;
			}
			var relativeSpeed = this.speed;
			//If unit has reached its target position, update target to goal
			if((Math.abs(this.targetPosition.x - this.currentPosition.x) < 0.01 )&& (Math.abs(this.targetPosition.y - this.currentPosition.y)< 0.01)) {
				this.targetPosition.x = 0.75;
				this.targetPosition.y = 0.75;

				relativeSpeed = relativeSpeed ;//* 65;
			}
			if(!this.isAIControlled) {
				this.currentPosition = this.targetPosition;
			}
			else {
				var remX = this.targetPosition.x - this.currentPosition.x;
				var remY = this.targetPosition.y - this.currentPosition.y;
				var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
				var slope = 0;
				if(remX != 0) {
					slope = remY/remX;
				}
				var c = this.targetPosition.y - slope*(this.targetPosition.x);
				var xSpeed = 0.001; //1 pixel per 100 milliseconds
				if(dist > 0.05) {

					if(remX > 0) {
						if(Math.abs(remX) > 0.001) {
							this.currentPosition.x += xSpeed;
						}
					}
					else {
						if(Math.abs(remX) > 0.001) {
							this.currentPosition.x -= xSpeed;
					}
				}

				this.currentPosition.y = slope*this.currentPosition.x + c;

				} 
				else {
					this.currentPosition.x = this.targetPosition.x;
					this.currentPosition.y = this.targetPosition.y;
				}
			}

			console.log("Plan to reach ("+this.targetPosition.x+","+this.targetPosition.y+",) now at ("+this.currentPosition.x+","+this.currentPosition.y+")");
			this.currentPosition.x = Math.min(this.currentPosition.x,0.95);
			this.currentPosition.y = Math.min(this.currentPosition.y,0.95);
			this.mapResource.x = this.currentPosition.x * canvasDoc.width;
			this.mapResource.y = this.currentPosition.y * canvasDoc.height;
  	};

 	this.parseInput =  function(functionName, params) {

 	};
  	this.updateEnemy =  function(entity) {

  	};
  	this.updateTarget = function(position) {
  		this.targetPosition = position;
  	};
  	this.updatePosition =  function(position) {
  		this.currentPosition = position;
  	};

  	reduceHealth= function(delta) {
  		this.health -=delta;
  	};


 };

/*var Unit = Class.create(Entity, {
	initialize : function($super, code,data,ownerId, isAIControlled) {

	}
})*/




categories = { Attacker : 1, Defender : 2, Voyeur : 3 };

Player = function(name, id, isServer, numPlayersOnBoard) {
	this.name 	= name;
	this.id 	= id.toString();
	this.colorCode = numPlayersOnBoard;
	this.units = {};
	this.towers = {};
	this.projectiles = new Array();
	this.totalUnits = 0;
	this.totalTowers = 0;
	this.isServer = isServer;
	this.battle = {state:"planning", whoami : categories.Defender};
	
	this.addUnit = function(unit) {
		if (!this.isServer)
			mainScene.getStage().append(unit.mapResource);
		console.log("add new unit " + unit.id);
		this.units[unit.id] = unit;
		this.totalUnits++;
	};

	this.addTower = function(tower) {
		if (!this.isServer)
			mainScene.getStage().append(tower.mapResource);
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
					console.log("RADSSSSS: got this in updateposition");
					console.log(state.units[key]);
					if(states.units[key].state != "dead") {
						var unit = new Unit(this, key, {code: state.units[key].code, position: state.units[key].position}, this.isServer, false);
						if (this.isServer) {
							unit.health = state.units[key].health ;
						}
					}
				}
				else {
					this.units[key].updateUnit(state, state.units[key]);
				}
			}
		}

		for(var key in state.towers) {
			if (key != 'undefined') {
				if (null == this.towers[key] || undefined == this.towers[key] ) {
					console.log("CREATE A TOWER position " + JSON.stringify(state.towers[key]));
					if(states.towers[key].state != "dead") {
						var tower = new Tower(this, key, {code: "001", position: state.towers[key].position}, this.isServer, false);
					}
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
					if (this.isServer)
						this.checkVictoryPosition(unitPositions[key].position);
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
				this.units[key].mapResource.remove();
				this.totalUnits--;
			}
		}
		for(var key in this.towers) {
			if (key != 'undefined') {
				this.towers[key].mapResource.remove();
				this.totalTowers--;
			}
		}
		this.units = {};
		this.towers = {};
	}

	this.checkVictoryPosition = function(position) {
		//TODO: Temporary, change this with appropriate position check
		if(position.x > 0.80 && position.y > 0.80) {
			this.battle.state = "over";
			this.battle.victor = this.id;
		}
	}

};

Projectile = function(owner, startPosition, targetRelativePosition, imgObject, projectileData) {
	this.projectileData = projectileData;

	var projectileObj =  mainScene.createElement(globalProjectileWidth, globalProjectileHeight);
    projectileObj.drawImage(imgObject, 0, 0, projectileData.width, projectileData.height, 0, 0, globalProjectileWidth, globalProjectileHeight);
    projectileObj.x = startPosition.x;
    projectileObj.y = startPosition.y;

    this.mapResource = projectileObj;
    this.targetRelativePosition = {x: targetRelativePosition.x, y: targetRelativePosition.y}
    this.hasHit = false;
	if (!this.isServer)
		mainScene.getStage().append(this.mapResource);
	console.log("add new projectile ");
	this.owner = owner;
	this.owner.projectiles.push(this);

	this.update = function() {
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

	}
}

Tower = function(player, id, tower, isServer, isOwner) {
	this.isOwner = isOwner;
	this.player = player;
	this.code = tower.code;
	this.lastProjectileFiredTime = null;
	this.isServer = isServer;
    this.id = id;
    this.currentPosition = tower.position;
    this.targetPosition = tower.position;
    this.isTower = true;
	this.maxHealth = tower_data[tower.code].health;
	this.range = tower_data[tower.code].range;
	this.hitsPerSecond = tower_data[tower.code].hitsPerSecond;
    if (!isServer) {
	    var imgObject = towerImages[tower.code];
	    var towerObj =  mainScene.createElement(globalTowerWidth, globalTowerHeight);
		towerObj.drawImage(imgObject, 0, 0, tower_data[tower.code].width, tower_data[tower.code].height, 0, 0, globalTowerWidth, globalTowerHeight);
		this.mapResource = towerObj;
		this.healthBar = new HealthBar(this.mapResource, globalTowerWidth, 0, this.maxHealth, 0);
		
		this.mapResource.cparent = this;
	    this.proImgObject = towerProjectileImages[tower.code];
	    this.proSpeed = tower_data[tower.code].projectileSpeed;
	    this.health = tower_data[tower.code].health;
   		this.state = "alive";
		if (this.isOwner) {
			this.mapResource.on("mousedown", function(e) {
				this.cparent.mouseDown(e);
			});
		}
	}
	// this has to be placed here - has to be called after mapResource is created on client
	this.player.addTower(this);

    this.updateTower = function(player, state) {
		if (this.isServer || me.id != player.id) {
			this.updateTarget(state.target);
			this.health = state.health;
		}
    	this.state = state.state;
		// this.updateHealthBar();
    	if(this.state == "dead" && !this.isServer) {
    		this.mapResource.remove();
    	}
    }

	this.updateHealthBar = function() {
		if(!isServer) {
			this.healthBar.updateHealth(this.health);
		}
	}

    this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
	}
    
	this.updatePosition = function(position) {
		this.currentPosition = position;
	};
	this.updateTarget = function(position) {
		this.targetPosition = position;
		this.currentPosition = position;
	};

	this.update = function() {
		if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}
		if(this && this.mapResource) {
			this.mapResource.x = (this.currentPosition.x * canvasDoc.width);
			this.mapResource.y = (this.currentPosition.y * canvasDoc.height);
			this.isInUnitRange();
			this.getUnitInRange();
			this.updateHealthBar();
		}
	};

	this.getState = function() {
		return {code: this.code, id : this.id, position : this.currentPosition, target : this.targetPosition, attacker : false, state: this.state, isTower: this.isTower, health: this.health};
	};

	this.isInUnitRange = function() {
		var opponent = null;
		if(this.state == "dead") {
			return;
		}
		for (var key in playersOnBoard) {
			if(key != me.id && (playersOnBoard[key].unitsOnBoard() > 0)) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.units ) {////hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var unit = opponent.units[key];
        	if(unit.state == "dead") {
        		continue;
        	}
        	var remX = unit.currentPosition.x  - this.currentPosition.x;
			var remY = unit.currentPosition.y - this.currentPosition.y;
			if(Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2)) < this.range) {
				unit.fireProjectile(this.currentPosition);
				this.health -= 5;
				if(this.health <= 0) {
					this.state = "dead";
				}
			}
        }
        return null;
	};

	this.fireProjectile = function(target) {
		if(this.lastProjectileFiredTime != null && ((new Date().getTime() - this.lastProjectileFiredTime)/1000 < 1/this.hitsPerSecond)) {
			return;
		}
		new Projectile(this.player, {x: this.mapResource.x,y: this.mapResource.y}, target, this.proImgObject, { width: tower_data[this.code].projectileWidth, height: tower_data[this.code].projectileHeight, speed: tower_data[this.code].projectileSpeed });
		this.lastProjectileFiredTime = new Date().getTime();
	}

	this.getUnitInRange = function() {
		var opponent = null;
		if(this.state == "dead") {
			return;
		}
		for (var key in playersOnBoard) {
			if(key != me.id && (playersOnBoard[key].unitsOnBoard() > 0)) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.units ) {
        	var unit = opponent.units[key];
        	if(unit.state == "dead") {
        		continue;
        	}
        	var remX = unit.currentPosition.x  - this.currentPosition.x;
			var remY = unit.currentPosition.y - this.currentPosition.y;
			if(Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2)) < this.range) {
				this.fireProjectile(unit.currentPosition);
				if(unit.health <= 0) {
					tower.state = "dead";
				}
			}
        }
        return null;
	};
};

HealthBar = function(parentResource, size, initial, max, color) {
	this.maxHealth = max;
	this.size = size;
	this.initial = initial;
	this.lifeBar = mainScene.createElement(this.size,10);
	this.deathBar = mainScene.createElement(this.size,10);
	parentResource.append(this.deathBar);
	parentResource.append(this.lifeBar);

	this.deathBar.fillStyle = "red";
	if (color == 0) {
		this.lifeBar.fillStyle = "green";
	}
	else if (color == 1) {
		this.lifeBar.fillStyle = "pink";
	}
	else if (color == 2) {
		this.lifeBar.fillStyle = "blue";
	}
	else if (color == 3) {
		this.lifeBar.fillStyle = "yellow";
	}
	this.deathBar.fillRect(0,0,this.size,10);
	this.lifeBar.fillRect(0,0,this.size,10);

	this.updateHealth = function (health) {
		this.lifeBar.fillRect(0,0, this.size * (health/this.maxHealth), 10);
	};
};

Unit = function(player, id, unit, isServer, isOwner) {
	this.id = id;
	this.isOwner = isOwner;
	this.player = player;
	this.code = unit.code;
	this.maxHealth = unit_data[unit.code].health;
	this.state = "alive";
	this.lastProjectileFiredTime = null;
	this.currentPosition = unit.position;
	this.isServer = isServer;
	this.isTower = false;
	this.targetPosition = {x : 0.85, y : 0.85};
	this.range = unit_data[unit.code].range;
	this.hitsPerSecond = unit_data[unit.code].hitsPerSecond;
	this.speed = unit_data[unit.code].unitSpeed;
	
	if (!isServer) {
	    var imgObject = unitImages[unit.code];
	    var unitObj =  mainScene.createElement(globalUnitWidth, globalUnitHeight);
		unitObj.drawImage(imgObject, 0, 0, unit_data[unit.code].width, unit_data[unit.code].height, 0, 0, globalUnitWidth, globalUnitHeight);
		this.mapResource = unitObj;
		this.healthBar = new HealthBar(this.mapResource, globalUnitWidth, 0, this.maxHealth, this.player.colorCode);

	    this.proImgObject = unitProjectileImages[this.code];
	    this.proSpeed = unit_data[this.code].projectileSpeed;
	    this.targetPosition = {x : 0.85, y : 0.85};
		this.mapResource.cparent = this;

		// check if it is my unit only then add mouse listener
		if (this.isOwner) {
			this.mapResource.on("mousedown", function(e) {
				this.cparent.mouseDown(e);
			});
		}
	    this.health = unit_data[unit.code].health;
	    this.state = "alive";
	}
	
	this.player.addUnit(this);
	
	this.updateUnit = function(player, state) {
		if (this.isServer || me.id != player.id) {
			this.updatePosition(state.position);
			this.updateTarget(state.target);
			this.health = state.health;
		}
		this.state = state.state;
		// this.updateHealthBar();
		if(this.state == "dead" && !this.isServer) {
			this.mapResource.remove();
		}
	};
	this.updatePosition = function(position) {
		this.currentPosition = position;
	};
	this.updateTarget = function(position) {
		this.targetPosition = position;
	};
	this.updateHealthBar = function() {
		if(!isServer) {
			this.healthBar.updateHealth(this.health);
		}
	}
	this.update = function() {
		if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}

		var relativeSpeed = this.speed;
		//If unit has reached its target position, update target to goal
		if(this.targetPosition.x == this.currentPosition.x && this.targetPosition.y == this.currentPosition.y) {

			// shud also move around towers?
			this.targetPosition.x = 0.85;
			this.targetPosition.y = 0.85;

			relativeSpeed = relativeSpeed * 0.35;
		}

		var remX = this.targetPosition.x - this.currentPosition.x;
		var remY = this.targetPosition.y - this.currentPosition.y;
		var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));

		if(dist > this.speed) {
			this.currentPosition.x += (remX / dist)*relativeSpeed;
			this.currentPosition.y += (remY / dist)*relativeSpeed;
		} else {
			this.currentPosition.x += remX;
			this.currentPosition.y += remY;
		}		
		this.mapResource.x = this.currentPosition.x * canvasDoc.width;
		this.mapResource.y = this.currentPosition.y * canvasDoc.height;
		this.getTowerInRange() ;
		this.isInTowerRange();
		this.updateHealthBar();
	};

	this.isInTowerRange = function() {
		var opponent = null;
		if(this.state == "dead") {
			return;
		}
		for (var key in playersOnBoard) {
			if(key != me.id && (playersOnBoard[key].towersOnBoard() > 0)) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.towers ) {////hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var tower = opponent.towers[key];
        	if(tower.state == "dead") {
        		continue;
        	}
        	var remX = tower.currentPosition.x  - this.currentPosition.x;
			var remY = tower.currentPosition.y - this.currentPosition.y;
			if(Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2)) < this.range) {
				tower.fireProjectile(this.currentPosition);
				this.health -= 5;
				if(this.health <= 0) {
					this.state = "dead";
				}
			}
        }
        return null;
	};

	this.getTowerInRange = function() {
		var opponent = null;
		if(this.state == "dead") {
			return;
		}
		for (var key in playersOnBoard) {
			if(key != me.id && (playersOnBoard[key].towersOnBoard() > 0)) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.towers ) { //hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var tower = opponent.towers[key];
        	if(tower.state == "dead") {
        		continue;
        	}
        	var remX = tower.currentPosition.x  - this.currentPosition.x;
			var remY = tower.currentPosition.y - this.currentPosition.y;
			if(Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2)) < this.range) {
				this.fireProjectile(tower.currentPosition);
				if(tower.health < 0) {
					tower.state = "dead";
				}
				return tower;
			}
        }
        return null;
	};

	this.getState = function() {
		return {code: this.code, id : this.id, position : this.currentPosition, target : this.targetPosition, state: this.state, isTower: this.isTower, health: this.health};
	};
	
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
	}
	this.fireProjectile = function(target) {
		if(this.lastProjectileFiredTime != null && ((new Date().getTime() - this.lastProjectileFiredTime)/1000 < 1/this.hitsPerSecond)) {
			return;
		}
		new Projectile(this.player, {x: this.mapResource.x, y: this.mapResource.y}, target, this.proImgObject, { width: unit_data[this.code].projectileWidth, height: unit_data[this.code].projectileHeight, speed: unit_data[this.code].projectileSpeed });
		this.lastProjectileFiredTime = new Date().getTime();
	}
};
