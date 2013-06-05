/**
 * Define models
 *
 * @param config
 * @param helpers
 */

var Player = function(name, id) {
	this.name 	= name;
	this.id 	= id;
	this.units = {};
	this.totalUnits = 0;
	
	this.addUnit = function(unit) {
		if (!SERVER)
			canvas.addChild(unit.mapResource);
		this.units[unit.id] = unit;
		this.totalUnits++
	};
	
	this.getUnits = function() {
		return this.units;
	};
	
	this.unitsOnBoard = function() {
		return this.totalUnits;
	};
	
	this.updatePosition = function(states) {
		$.each(states, function(index, state) {
			for(var key in state.units) {
				if (null == this.units[key]) {
					var unit = new Unit(state.units[key].id, state.units[key].attacker, state.units[key].position);
					this.addUnit(unit);
				}
				else {
					this.units[key].updatePosition(state.units[key].position);
				}
			}
		});
	};
	this.update = function() {
		for(var key in this.units) {
			this.units[key].update();
		}
	};
	
	this.getState = function() {
		unitPositions = {};
		for(var key in this.units) {
			unitPositions[key] = this.units[key].getState();
		}
		return {name : this.name, id : this.id, units : unitPositions}
	}
};

var Unit = function(id, attacker, position) {
	this.id = id;
	this.isAttacker = attacker;
	this.currentPosition = position;
	this.targetPosition = {x : 0, y : 0};
	if (!SERVER)
		this.mapResource = Box(this.currentPosition);

	this.updatePosition = function(position) {
		this.currentPosition = position;
	};
	this.update = function() {
		var remX = (targetPosition.x * canvasDoc.width) - currentPosition.x;
		var remY = (targetPosition.y * canvasDoc.height)- currentPosition.y;
		var dist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
		if(dist != 0) {
			currentPosition.x += (remX / dist);
			currentPosition.y += (remY / dist);
		}
		/*
		if( Math.abs((currentPosition.x / canvasDoc.width) - currentServertargetPosition.x) > 0.005 ) {
			currentPosition.x = currentServertargetPosition.x * canvasDoc.width;
		}

		if( Math.abs((currentPosition.y / canvasDoc.height) - currentServertargetPosition.y) > 0.005 ) {
			currentPosition.y = currentServertargetPosition.y * canvasDoc.height;
		}
		*/
		this.mapResource.x = currentPosition.x;
		this.mapResource.y = currentPosition.y;
	};
	this.updateTarget = function(position) {
		this.targetPosition = position;
	};

	this.getState = function() {
		return {position : this.currentPosition, target : this.targetPosition, attacker : isAttacker};
	};
	
	this.mouseClick = function() {
		var relX = event.offsetX / canvasDoc.width;
		var relY = event.offsetY / canvasDoc.height;
		this.updateTarget({x : relX, y : relY});
	}
};