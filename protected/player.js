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
		this.units[tower.id] = tower;
		this.totalUnits++
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
						// console.log("unit is null " + key);
						// console.log("position " + JSON.stringify(state.units[key]));
						
						var unit = new Unit(key, state.units[key].attacker, state.units[key].position, this.isServer, false);
						this.addUnit(unit);
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
			if (key != 'undefined')
				this.units[key].update();
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


Unit = function(id, attacker, position, isServer, isOwner) {
	this.id = id;
	this.isAttacker = attacker;
	this.isOwner = isOwner;
	this.currentPosition = position;
	this.targetPosition = {x : 0, y : 0};
	if (!isServer) {
		this.mapResource = null;
		if (this.isAttacker) {
			this.mapResource = AttackUnitResource(this.currentPosition);
		}
		else {
		
		}
		this.mapResource.cparent = this;
		
		// check if it is my unit only then add mouse listener
		if (isOwner) {
			this.mapResource.on("mousedown", function(e) {
				this.cparent.mouseDown(e);
			});
		}
		/*
		this.mapResource.on("mouseup", function(e) {
			this.cparent.mouseUp(e);
		});
		*/
	}

	this.updateUnit = function(state) {
		this.updatePosition(state.position);
		if (this.isAttacker) {
			this.updateTarget(state.target);
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
		if (this.isAttacker) {
 
			var remX = (this.targetPosition.x * canvasDoc.width) - this.currentPosition.x;
			var remY = (this.targetPosition.y * canvasDoc.height)- this.currentPosition.y;
			var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
			if(dist != 0) {
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
		}
		else {
		
		}
		this.mapResource.x = this.currentPosition.x;
		this.mapResource.y = this.currentPosition.y;
	};

	this.getState = function() {
		return {id : this.id, position : this.currentPosition, target : this.targetPosition, attacker : this.isAttacker};
	};
	
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.mapResource.opacity = this.mapResource.opacity < 1 ? 1 : 0.5 ;
		//var relX = event.offsetX / canvasDoc.width;
		//var relY = event.offsetY / canvasDoc.height;
		//this.updateTarget({x : relX, y : relY});
	}
};
