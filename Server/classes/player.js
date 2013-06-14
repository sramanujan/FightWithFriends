require('../../Common/map.js');

/**
 * Define models
 *
 * @param config
 * @param helpers
 */
categories = { Attacker : 1, Defender : 2, Voyeur : 3 };
Position = function(x,y) {
	this.x = x;
	this.y = y;
}

Entity = function(code, data, ownerId, isAIControlled, isDefender, index) {
	this.code = code;
    this.data = data[code];
	this.health = data[code].health;
	this.range = data[code].range;
    this.currentTilePosition = {x: 0, y: 0};
    this.targetTilePosition = {x:0, y: 0};
	this.enemy = null;
	this.ownerId = ownerId;
	this.isAIControlled = isAIControlled;
	this.isDefender = isDefender;
	this.index = index;
	this.state = "alive";
    this.lastMoved = new Date().getTime();

  	this.update =function() {
        var time = new Date().getTime();

  		if(this.state == "dead") {
			//this.mapResource.remove();
			return false;
		}

		//If unit has reached its target position, update target to goal
        if(this.targetTilePosition.x == this.currentTilePosition.x && this.targetTilePosition.y == this.currentTilePosition.y && isAIControlled) {
        //if((Math.abs(this.targetPosition.x - this.currentPosition.x) < 0.01 )&& (Math.abs(this.targetPosition.y - this.currentPosition.y)< 0.01) && isAIControlled) {
            //this.targetPosition.x = 0.75;
            //this.targetPosition.y = 0.75;
            this.targetTilePosition.x = 14;
            this.targetTilePosition.y = 7;
        }
        if(!this.isAIControlled) {
            this.currentTilePosition = this.targetTilePosition;
        }
        else {
            //var targetAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.targetTilePosition);
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

		//console.log("Plan to reach ("+this.targetPosition.x+","+this.targetPosition.y+",) now at ("+this.currentPosition.x+","+this.currentPosition.y+")");
		//this.currentPosition.x = Math.min(this.currentPosition.x,0.95);
		//this.currentPosition.y = Math.min(this.currentPosition.y,0.95);
        this.lastMoved = time;	
  	};

 	this.parseInput =  function(functionName, params) {

 	};
  	this.updateEnemy =  function(entity) {

  	};
  	this.updateTarget = function(position) {
  		this.targetTilePosition = position;
  	};
  	this.updatePosition =  function(position) {
  		this.currentTilePosition = position;
  	};

  	reduceHealth= function(delta) {
  		this.health -=delta;
  	};

  	this.resolveBattle = function(entities) {
  		//console.log(this.code + " RESOLVEBATTLE");
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
  			if(entity.isDefender ^ this.isDefender) {
  				continue;
  			}
  			var remX = entity.currentTilePosition.x - this.currentTilePosition.x;
  			var remY = entity.currentTilePosition.y - this.currentTilePosition.y;
  			var dest = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
  			//console.log("Total distance diff = "+dest);
  			if(dest < minDistance) {
  				minDistance = dest;
  				nearestOpponent = entity;
  			}
  		}
  		if(nearestOpponent != null) {
  			if(minDistance <= this.range) {
  				nearestOpponent.health -= 10;
  				console.log(this.code + " attacked "+ nearestOpponent.code);
  				if(nearestOpponent.health <= 0) {
  					nearestOpponent.state = "dead";
  					console.log("YAY KILLED ON SERVER FINALLY");
  				}
  			}
  		}
  	}


 };


Player = function(name, id, isServer, numPlayersOnBoard) {
	this.name 	= name;
	this.id 	= id.toString();
	this.colorCode = numPlayersOnBoard;
	this.units = {};
	this.towers = {};
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