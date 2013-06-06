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
	this.totalUnits = 0;
	this.totalTowers = 0;
	this.isServer = isServer;
	
	this.addUnit = function(unit) {
		if (!this.isServer)
			mainScene.getStage().append(unit.mapResource);
		console.log("add new unit " + unit.id);
		this.units[unit.id] = unit;
		this.totalUnits++
	};

	this.addTower = function(tower) {
		if (!this.isServer)
			mainScene.getStage().append(tower.mapResource);
		console.log("add new tower " + tower.id);
		this.towers[tower.id] = tower;
		this.totalTowers++
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
						console.log("CREATE A UNIT position " + JSON.stringify(state.units[key]));
						if(states.units[key].state != "dead") {
							var unit = new Unit(this, key, {code: "001", position: state.units[key].position}, this.isServer, false);
							if (this.isServer) {
								console.log("unit is null " + key);
								this.addUnit(unit);
							}
						}
					}
					else {
						// console.log("unit is NOT null " + this.id);
						if(state.units[key].state == "dead") {
							console.log("DIE PLEASE");
							//delete this.units[key];
						}
						console.log("position " + JSON.stringify(state));
						this.units[key].updateUnit(state.units[key]);
						if (this.isServer || me.id != state.id) {
							//if(states.units[key].state != "dead") {
								this.units[key].updateUnit(state.units[key]);
							//}
							/*else {
								delete this.units[key];
							}*/
						}
					}
				}
			}


			for(var key in state.towers) {
				if (key != 'undefined') {
					if (null == this.towers[key] || undefined == this.towers[key] ) {
						console.log("CREATE A UNIT position " + JSON.stringify(state.towers[key]));
						if(states.towers[key].state != "dead") {
							var tower = new Tower(this, key, {code: "001", position: state.towers[key].position}, this.isServer, false);
							if (this.isServer) {
								console.log("unit is null " + key);
								this.addTower(tower);
							}
						}
					}
					else {
						// console.log("unit is NOT null " + this.id);
						if(state.towers[key].state == "dead") {
							console.log("DIE PLEASE");
							//delete this.towers[key];
						}
						console.log("position " + JSON.stringify(state));
						this.towers[key].updateTower(state.towers[key]);
						if (this.isServer || me.id != state.id) {
							//if(states.towers[key].state != "dead") {
								this.towers[key].updateTower(state.towers[key]);
							//}
							/*else {
								delete this.units[key];
							}*/
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
	};
	
	this.getState = function() {
		unitPositions = {};
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
		return {name : this.name, id : this.id, units : unitPositions, towers:towerPositions};
	};
	
	this.leaveRoom = function() {
		this.units = {};
		this.towers = {};
	}
};

Tower = function(player, id, tower, isServer, isOwner) {
	this.isOwner = isOwner;
	this.player = player;
	this.state = "alive";
	this.isServer = isServer;
    if (!isServer) {
	    /*var imgObject = new Image();
	    imgObject.dparent = this;
	    imgObject.onload = function() {
			var towerObj =  mainScene.createElement(100,100);
		    towerObj.drawImage(imgObject);
		    towerObj.x = tower.position.x;
		    towerObj.y = tower.position.y;
		    this.dparent.mapResource = towerObj;
		    this.dparent.mapResource.cparent = this.dparent;
		    this.dparent.player.addTower(this.dparent);
    		// check if it is my unit only then add mouse listener
			if (this.dparent.isOwner) {
				this.dparent.mapResource.on("mousedown", function(e) {
					this.cparent.mouseDown(e);
				});
			}
	    }*/
	    //imgObject.src = tower_data[tower.code].image;
	    var imgObject = towerImages[tower.code];
	    var towerObj =  mainScene.createElement(1,1);
		towerObj.drawImage(imgObject);
		towerObj.x = tower.position.x;
		towerObj.y = tower.position.y;
		this.mapResource = towerObj;
		this.id = id;
		player.addTower(this);
		//me.addTower(this);
		this.mapResource.cparent = this;
	    this.health = tower_data[tower.code].health;
	    this.mapResource.on("mousedown", function(e) {
					this.cparent.mouseDown(e);
				});
	}

    this.currentPosition = tower.position;
    this.targetPosition = tower.position;
    this.isTower = true;
    this.id = id;
    

    this.updateTower = function(state) {
    	this.state = state.state;
    	if(this.state == "dead" && !this.isServer) {
    		this.mapResource.remove();
    	}
    }

    this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
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
		if(this.state == "dead") {
			this.mapResource.remove();
			return false;
		}
		if(this && this.mapResource ) {
			this.mapResource.x = (this.targetPosition.x * canvasDoc.width);
			this.mapResource.y = (this.targetPosition.y * canvasDoc.height);
			this.currentPosition = this.targetPosition;
			var unitToAttack = this.getUnitInRange();
			/*if(unitToAttack != null) {
				unitToAttack.health = unitToAttack.health - 10;
			}*/
			this.isInUnitRange();
		}
	};

	this.getState = function() {
		return {id : this.id, position : this.currentPosition, target : this.targetPosition, attacker : false, state: this.state};
	};

	this.isInUnitRange = function() {
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
				this.health -= 5;
				if(this.health <= 0) {
					this.state = "dead";
				}
				//return tower;
			}
        }
        return null;
	};

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
				if(tower.health <= 0) {
					tower.state = "dead";
				}
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
	this.state = "alive";
	this.currentPosition = unit.position;
	this.isServer = isServer;
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
		for (var key in playersOnBoard) {
			if(key != me.id) {
				opponent = playersOnBoard[key];
				break;
			}
        }
        if(opponent == null) {
        	return null;
        }
        for(var key in opponent.towers ) {////hack due to stupid logic of units and towers storage.change to opponent tower when fixed
        	var tower = opponent.towers[key];
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
				if(tower.health < 0) {
					tower.state = "dead";
				}
				return tower;
			}
        }
        return null;
	};



	this.getState = function() {
		return {id : this.id, position : this.currentPosition, target : this.targetPosition, state: this.state};
	};
	
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
	}
};
