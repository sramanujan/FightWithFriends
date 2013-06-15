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

        this.lastMoved = time;	
  	};

  	this.updateTarget = function(position) {
  		this.targetTilePosition = position;
  	};
  	this.updatePosition =  function(position) {
  		this.currentTilePosition = position;
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
  			if(!(entity.isDefender ^ this.isDefender)) {
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
  				if(nearestOpponent.health <= 0) {
  					nearestOpponent.state = "dead";
  				}
  			}
  		}
  	}
 };


Player = function(name, id, isServer, numPlayersOnBoard) {
	this.name 	= name;
	this.id 	= id.toString();
	this.colorCode = numPlayersOnBoard;
	this.isServer = isServer;
	this.battle = {state:"planning", whoami : categories.Defender};

	this.getState = function() {
		return {name : this.name, id : this.id};
	};
};