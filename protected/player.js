/**
 * Define models
 *
 * @param config
 * @param helpers
 */

Player = function(name, id, isServer) {
	this.name 	= name;
	this.id 	= id.toString();
	this.units = {};
	this.towers = {};
	this.projectiles = new Array();
	this.totalUnits = 0;
	this.totalTowers = 0;
	this.isServer = isServer;
	
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
		// $.each(states, function(index, state) {
		// for(i = 0; i < states.length; i++) {
			// state = states[i];
			var state = states;
			for(var key in state.units) {
				if (key != 'undefined') {
					if (null == this.units[key]) {
						// console.log("position " + JSON.stringify(state.units[key]));
						var unit = new Unit(this, key, {code: "001", position: state.units[key].position}, this.isServer, false);
						if (this.isServer) {
							console.log("unit is null " + key);
							this.addUnit(unit);
						}
					}
					else {
						// console.log("unit is NOT null " + this.id);
						// console.log("position " + JSON.stringify(state.units[key]));
						if (this.isServer || me.id != state.id) {
							this.units[key].updateUnit(state.units[key]);
						}
					}
				}
			}
		// }
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
		for(var key in this.units) {
			if (key != 'undefined') {
				unitPositions[key] = this.units[key].getState();
			}
		}
		return {name : this.name, id : this.id, units : unitPositions}
	};
	
	this.leaveRoom = function() {
		this.units = {};
		this.towers = {};
	}
};

Projectile = function(startPosition, targetPosition, imgObject, speed) {
	var projectileObj =  mainScene.createElement(20,20);
    projectileObj.drawImage(imgObject);
    projectileObj.x = startPosition.x;
    projectileObj.y = startPosition.y;

    this.mapResource = projectileObj;
    this.targetPosition = targetPosition;
    this.speed = speed;

	if (!this.isServer)
		mainScene.getStage().append(this.mapResource);
	console.log("add new projectile ");
	me.projectiles.push(this);

	this.update = function() {
		if(this && this.mapResource ) {
			var remX = (this.targetPosition.x - (this.mapResource.x / canvasDoc.width));
			var remY = (this.targetPosition.y - (this.mapResource.y / canvasDoc.height));
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(totalDist < 0.05) {
				this.mapResource.remove();
				return false;
			} else if(this.speed < totalDist) {
				this.mapResource.x += canvasDoc.width * remX * (this.speed /  totalDist);
				this.mapResource.y += canvasDoc.height * remY * (this.speed /  totalDist);	
				return true;
			} else {
				this.mapResource.x += canvasDoc.width * remX;
				this.mapResource.y += canvasDoc.height * remY;
				return true;
			}
		}
		return true;
	}
}

Tower = function(player, id, tower, isServer, isOwner) {
	this.isOwner = isOwner;
	this.player = player;
    if (!isServer) {
	    var imgObject = towerImages[tower.code];
	    var towerObj =  mainScene.createElement(1,1);
		towerObj.drawImage(imgObject);
		towerObj.x = tower.position.x;
		towerObj.y = tower.position.y;
		this.mapResource = towerObj;
		this.id = id;
		player.addTower(this);
		this.mapResource.cparent = this;
	    this.proImgObject = projectileImages[tower.code];
	    this.proSpeed = tower_data[tower.code].projectileSpeed;
	    this.health = tower_data[tower.code].health;
	    this.mapResource.on("mousedown", function(e) {
			this.cparent.mouseDown(e);
		});
	}

    this.currentPosition = tower.position;
    this.targetPosition = tower.position;
    this.isTower = true;
    this.id = id;
    


    this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		//start a random projectile...

		this.fireProjectile({x: Math.random(), y: Math.random()});
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
	}
    
	this.updatePosition = function(position) {
		this.currentPosition = position;
	};
	this.updateTarget = function(position) {
		this.targetPosition = position;
	};



	this.update = function() {
		if(this && this.mapResource ) {
			this.mapResource.x = (this.targetPosition.x * canvasDoc.width);
			this.mapResource.y = (this.targetPosition.y * canvasDoc.height);
			this.currentPosition = this.targetPosition;
			var unitToAttack = this.getUnitInRange();
			if(unitToAttack != null) {
				unitToAttack.health = unitToAttack.health - 10;
			}
		}
	};

	this.getState = function() {
		return {id : this.id, position : this.currentPosition, target : this.targetPosition, attacker : false};
	};

	this.fireProjectile = function(target) {
		var projectile = new Projectile(this.currentPosition, target, this.proImgObject, this.proSpeed);
	}

	this.getUnitInRange = function() {
		var opponent = null;
		for (var key in playersOnBoard) {
			if(key != me.id) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.units ) {////hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var tower = opponent.units[key];
        	var x = tower.mapResource.x;
        	var y = tower.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
				return tower;
			}
        }
        return null;
	};
};

Unit = function(player, id, unit, isServer, isOwner) {
	this.id = id;
	this.isOwner = isOwner;
	this.player = player;
	this.maxHealth = unit_data[unit.code].health;
	this.currentPosition = unit.position;
	this.isTower = false;
	this.targetPosition = {x : 0, y : 0};
	if (!isServer) {
		this.mapResource = null;
	    /*var imgObject = new Image();
	    imgObject.dparent = this;
	    imgObject.onload = function() {
			var unitObj =  mainScene.createElement(64,64);
		    unitObj.drawImage(imgObject);
		    this.dparent.mapResource = unitObj;
		    this.dparent.mapResource.cparent = this.dparent;
		    this.dparent.player.addUnit(this.dparent);
    		// check if it is my unit only then add mouse listener
			if (this.dparent.isOwner) {
				this.dparent.mapResource.on("mousedown", function(e) {
					this.cparent.mouseDown(e);
				});
			}
	    }
	    imgObject.src = unit_data[unit.code].image;*/
	    var imgObject = unitImages[unit.code];
	    var unitObj =  mainScene.createElement(64,64);
		unitObj.drawImage(imgObject);
		this.mapResource = unitObj;
		this.healthBar = mainScene.createElement(50,10);
		this.healthBarBg = mainScene.createElement(50,10);
		this.mapResource.append(this.healthBarBg);
		this.mapResource.append(this.healthBar);
		this.healthBarBg.fillStyle = "red";
		this.healthBar.fillStyle = "green";
		this.healthBarBg.fillRect(0,0,50,10);
		this.healthBar.fillRect(0,0,50,10);
		    this.mapResource.cparent = this;
		    this.player.addUnit(this);
    		// check if it is my unit only then add mouse listener
			if (this.isOwner) {
				this.mapResource.on("mousedown", function(e) {
					this.cparent.mouseDown(e);
				});
			}
	    this.health = unit_data[unit.code].health;
	}
	
	this.updateUnit = function(state) {
		this.updatePosition(state.position);
		this.updateTarget(state.target);
		this.updateHealth();
	};
	this.updatePosition = function(position) {
		this.currentPosition = position;
	};
	this.updateTarget = function(position) {
		this.targetPosition = position;
	};
	this.updateHealth = function() {
		if(!isServer) {
			this.healthBar.refresh();
			this.healthBar.fillRect(0,0,50 * (this.health/this.maxHealth),10);
			//this.healthBar.width = this.health/this.maxHealth;
		}
		//this.healthBar = this.mapResource.createElement(50,10)
	}
	this.update = function() {
		var remX = (this.targetPosition.x * canvasDoc.width) - this.currentPosition.x;
		var remY = (this.targetPosition.y * canvasDoc.height)- this.currentPosition.y;
		var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
		if(Math.pow(dist, 2) > 1) {
			this.currentPosition.x += (remX / dist);
			this.currentPosition.y += (remY / dist);
		}
		/*
		if( Math.abs((currentPosition.x / canvasDoc.width) - currentServertargetPosition.x) > 0.005 ) {
			currentPosition.x = currentServertargetPosition.x * canvasDoc.width;
		}

		if( Math.abs((currentPosition.y / canvasDoc.height) - currentServertargetPosition.y) > 0.005 ) {
			currentPosition.y = currentServertargetPosition.y * canvasDoc.height;
		}
		*/
		this.mapResource.x = this.currentPosition.x;
		this.mapResource.y = this.currentPosition.y;
		var towerToAttack = this.getTowerInRange() ;
		if(towerToAttack != null) {
			//fire
			towerToAttack.health = towerToAttack.health - 5;
		}
	};

	this.getTowerInRange = function() {
		var opponent = null;
		for (var key in playersOnBoard) {
			if(key != me.id) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.towers ) { //hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var tower = opponent.towers[key];
        	var x = tower.mapResource.x;
        	var y = tower.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
				return tower;
			}
        }
        return null;
	};

	this.getState = function() {
		return {id : this.id, position : this.currentPosition, target : this.targetPosition};
	};
	
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
	}
};
