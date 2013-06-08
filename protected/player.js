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
					if (null == this.units[key] || undefined == this.units[key] ) {
						 //console.log("CREATE A UNIT position " + JSON.stringify(state.units[key]));
						if(states.units[key].state != "dead") {
							var unit = new Unit(this, key, {code: "001", position: state.units[key].position}, this.isServer, false);
							if (this.isServer) {
								// console.log("unit is null " + key);
								// this.addUnit(unit);
								unit.health = state.units[key].health ;
							}
						}
					}
					else {
						 //console.log("unit is NOT null " + this.id);
						if(state.units[key].state == "dead") {
							//console.log("DIE PLEASE");
							//delete this.units[key];
							this.units[key].updateUnit(state, state.units[key]);
						}
						// console.log("position " + JSON.stringify(state));
						
						//if (this.isServer) {
							//if(states.units[key].state != "dead") {
								this.units[key].updateUnit(state, state.units[key]);
							//}
							/*else {
								delete this.units[key];
							}*/
						//}
					}
				}
			}


			for(var key in state.towers) {
				if (key != 'undefined') {
					if (null == this.towers[key] || undefined == this.towers[key] ) {
						console.log("CREATE A TOWER position " + JSON.stringify(state.towers[key]));
						if(states.towers[key].state != "dead") {
							var tower = new Tower(this, key, {code: "001", position: state.towers[key].position}, this.isServer, false);
							// if (this.isServer) {
								// console.log("tower is null " + key);
								// this.addTower(tower);
							// }
						}
					}
					else {
						// console.log("unit is NOT null " + this.id);
						if(state.towers[key].state == "dead") {
							// console.log("DIE PLEASE");
							//delete this.towers[key];
						}
						// console.log("position " + JSON.stringify(state));
						
						//if (this.isServer) {
							//if(states.towers[key].state != "dead") {
								this.towers[key].updateTower(state, state.towers[key]);
							//}
							/*else {
								delete this.units[key];
							}*/
						//}
					}
				}
			}
		// }
	};
	this.update = function() {
		for(var key in this.units) {
			if (key != 'undefined') {
				this.units[key].update();
				/*if(this.units[key].state == "dead") {
					delete this.units[key];
				}*/
			}

		}
		for(var key in this.towers) {
			if (key != 'undefined')
				this.towers[key].update();
				/*if(this.towers[key].state == "dead") {
					delete this.towers[key];
				}*/
		}
		for(var i = this.projectiles.length - 1; i >= 0; i--) {
			if(this.projectiles[i].update() == false) {
				this.projectiles.splice(i,1);
			}
		}
	};
	
	this.getState = function() {
		unitPositions = {};
		towerPositions = {};
		for(var key in this.units) {
			if (key != 'undefined') {
				unitPositions[key] = this.units[key].getState();
			}
		}
		towerPositions = {};
		for(var key in this.towers) {
			if (key != 'undefined') {
				towerPositions[key] = this.towers[key].getState();
			}
		}
		return {name : this.name, id : this.id, units : unitPositions, towers : towerPositions}
	};
	
	this.leaveRoom = function() {
		for(var key in this.units) {
			if (key != 'undefined') {
				this.units[key].mapResource.remove();
			}
		}
		for(var key in this.towers) {
			if (key != 'undefined') {
				this.towers[key].mapResource.remove();
			}
		}
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
    this.hasHit = false;
	if (!this.isServer)
		mainScene.getStage().append(this.mapResource);
	console.log("add new projectile ");
	me.projectiles.push(this);

	this.update = function() {
		if(this && this.mapResource ) {
			/*var remX = (this.targetPosition.x - (this.mapResource.x / canvasDoc.width));
			var remY = (this.targetPosition.y - (this.mapResource.y / canvasDoc.height));
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(totalDist < 0.05) {
				this.hasHit = true;
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
			}*/
			var remX = (this.targetPosition.x - this.mapResource.x );
			var remY = (this.targetPosition.y - this.mapResource.y );
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(totalDist < 20) {
				this.hasHit = true;
				this.mapResource.remove();
				return false;
			} else if(this.speed < totalDist) {
				this.mapResource.x +=  remX * this.speed ;// /  totalDist;
				this.mapResource.y +=  remY * this.speed ;// /  totalDist;	
				return true;
			} else {
				this.mapResource.x +=  remX;
				this.mapResource.y +=  remY;
				return true;
			}

		}

	}

		/*var remX = (this.mapResource.x - this.mapResource.x );
			var remY = (this.mapResource.y - (this.mapResource.y / canvasDoc.height));
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(totalDist < 0.05) {
				this.hasHit = true;
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
		return true;
	}*/
}

Tower = function(player, id, tower, isServer, isOwner) {
	this.isOwner = isOwner;
	this.player = player;
	this.code = tower.code;
	this.projectileFired = null;
	this.isServer = isServer;
    this.id = id;
    this.currentPosition = tower.position;
    this.targetPosition = tower.position;
    this.isTower = true;
	this.maxHealth = tower_data[tower.code].health;
	
    if (!isServer) {
	    var imgObject = towerImages[tower.code];
	    var towerObj =  mainScene.createElement(100,100);
		towerObj.drawImage(imgObject);
		//towerObj.x = tower.position.x;
		//towerObj.y = tower.position.y;
		this.mapResource = towerObj;
		this.healthBar = new HealthBar(this.mapResource, 200, 0, this.maxHealth);
		
		this.mapResource.cparent = this;
	    this.proImgObject = projectileImages[tower.code];
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
		}
    	this.state = state.state;
    	this.health = state.health;
		this.updateHealthBar();
    	if(this.state == "dead" && !this.isServer) {
    		this.mapResource.remove();
    	}
    }

	this.updateHealthBar = function() {
		if(!isServer) {
			this.healthBar.updateHealth(this.health);
			// this.healthBar.fillRect(0,0,50 * (this.health/this.maxHealth),10);
			//this.healthBar.width = this.health/this.maxHealth;
		}
		//this.healthBar = this.mapResource.createElement(50,10)
	}

    this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		//start a random projectile...

		//this.fireProjectile({x: Math.random(), y: Math.random()});
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
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
		if(this && this.mapResource ) {
			this.mapResource.x = (this.currentPosition.x * canvasDoc.width);
			this.mapResource.y = (this.currentPosition.y * canvasDoc.height);
			//var unitToAttack = this.getUnitInRange();
			/*if(unitToAttack != null) {
				unitToAttack.health = unitToAttack.health - 10;
			}*/
			this.isInUnitRange();
			this.getUnitInRange();
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
        	var tower = opponent.units[key];
        	if(tower.state == "dead") {
        		continue;
        	}
        	var x = tower.mapResource.x;
        	var y = tower.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
				this.health -= 5;
				if(this.health <= 0) {
					this.state = "dead";
				}
				//return tower;
			}
        }
        return null;
	};

	this.fireProjectile = function(target) {
		if(this.projectileFired != null && this.projectileFired.hasHit == false) {
			return;
		}
		this.projectileFired = new Projectile({x: this.mapResource.x,y: this.mapResource.y}, target, this.proImgObject, this.proSpeed);
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
        for(var key in opponent.units ) {////hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var unit = opponent.units[key];
        	if(unit.state == "dead") {
        		continue;
        	}
        	var x = unit.mapResource.x;
        	var y = unit.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
				if(unit.health <= 0) {
					unit.state = "dead";
				}
				this.fireProjectile(unit.currentPosition);
				//return tower;
			}
        }
        return null;
	};
};

HealthBar = function(parentResource, size, initial, max) {
	this.maxHealth = max;
	this.size = size;
	this.initial = initial;
	this.lifeBar = mainScene.createElement(this.size,10);
	this.deathBar = mainScene.createElement(this.size,10);
	parentResource.append(this.deathBar);
	parentResource.append(this.lifeBar);

	this.deathBar.fillStyle = "red";
	this.lifeBar.fillStyle = "green";
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
	this.currentPosition = unit.position;
	this.isServer = isServer;
	this.isTower = false;
	this.targetPosition = {x : 0, y : 0};
	if (!isServer) {
	    var imgObject = unitImages[unit.code];
	    var unitObj =  mainScene.createElement(64,64);
		unitObj.drawImage(imgObject);
		this.mapResource = unitObj;
		this.healthBar = new HealthBar(this.mapResource, 50, 0, this.maxHealth);
		
		// this.healthBar = mainScene.createElement(50,10);
		// this.healthBarBg = mainScene.createElement(50,10);
		// this.mapResource.append(this.healthBarBg);
		// this.mapResource.append(this.healthBar);
		// this.healthBarBg.fillStyle = "red";
		// this.healthBar.fillStyle = "green";
		// this.healthBarBg.fillRect(0,0,50,10);
		// this.healthBar.fillRect(0,0,50,10);

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
	// this has to be placed here - has to be called after mapResource is created on client
	this.player.addUnit(this);
	
	this.updateUnit = function(player, state) {
		if (this.isServer || me.id != player.id) {
			this.updatePosition(state.position);
			this.updateTarget(state.target);
		}
		this.health = state.health;
		this.updateHealthBar();
		this.state = state.state;
		if(this.state == "dead" && !this.isServer) {
			this.mapResource.remove();
		}
		// update health and stuff
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
			// this.healthBar.fillRect(0,0,50 * (this.health/this.maxHealth),10);
			//this.healthBar.width = this.health/this.maxHealth;
		}
		//this.healthBar = this.mapResource.createElement(50,10)
	}
	this.update = function() {
		if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}
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
		/*if(towerToAttack != null) {
			//fire
			towerToAttack.health = towerToAttack.health - 5;
		}*/
		this.isInTowerRange();
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
        	var x = tower.mapResource.x;
        	var y = tower.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
				tower.fireProjectile(this.currentPosition);
				this.health -= 5;
				if(this.health <= 0) {
					this.state = "dead";
				}
				//return tower;
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
        	var x = tower.mapResource.x;
        	var y = tower.mapResource.y;
        	var remX = x  - this.mapResource.x;
			var remY = y - this.mapResource.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist < 300) {
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
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
	}
};
