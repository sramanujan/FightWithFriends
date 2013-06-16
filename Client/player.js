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
    this.rotation = 0;
	this.enemy = null;
	this.ownerId = ownerId;
	this.isAIControlled = isAIControlled;
	this.isDefender = isDefender;
	this.index = index;
    this.lastMoved = new Date().getTime();
    this.state = "alive";
    this.isMoving = true;
	
    this.drawableObject = new DrawableObject(this.data.type, this.code, {x: 0, y: 0}, this.data.width, this.data.height, this.data.frames -1, this);

	if(this.ownerId == me.id) {
        this.drawableObject.addTouchAndClickListener(function(e) {
            this.tParent.parent.mouseDown(e);
        });
	}
	this.mouseDown = function(event) {
		currentSelectedUnit = this;
		this.drawableObject.setOpacity (this.drawableObject.getOpacity() < 1 ? 1 : 0.5 );
	}
    this.mouseUp = function(position) {
        this.updateTargetTile(MAP_CONFIG.convertAbsoluteToTile(position));
        globalInputs[numInputs] = {
            action: "updateTargetPosition", 
            params: {
                x: this.targetTilePosition.x,
                y: this.targetTilePosition.y,
                entityIndex: this.index
            }
        };
        numInputs++;
    }

    this.healthBar = new HealthBar(this.drawableObject, this.data.type, this.health, this.maxHealth, 0);

    this.hitsPerSecond = item_data[this.code].hitsPerSecond;
    this.fireProjectile = function(target) {
      if(this.lastProjectileFiredTime != null && ((new Date().getTime() - this.lastProjectileFiredTime)/1000 < 1/this.hitsPerSecond)) {
        return;
      }
      projectiles.push(new Projectile( this.data.projectile, this, target ));      
      this.lastProjectileFiredTime = new Date().getTime();
    }

    this.update =function() {
        var time = new Date().getTime();
		//If unit has reached its target position, update target to goal
        if(this.targetTilePosition.x == this.currentTilePosition.x && this.targetTilePosition.y == this.currentTilePosition.y && this.isAIControlled) {
            this.isMoving = false;
            this.updateRotations();
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
   
        this.healthBar.updateHealth(this.health);
        this.lastMoved = time;
        if(this.currentTilePosition.x == 15 && this.currentTilePosition.y == 8) {
            return true;
        }
  	};

    this.updateDisplay = function() {
        if(this.state == "dead") {
            this.drawableObject.stopAnimation();
            this.drawableObject.remove();
            return false;
        }
        this.currentAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.currentTilePosition);
        this.drawableObject.setPosition(this.currentAbsolutePosition);
        this.drawableObject.setRotation(this.rotation);
        if(!this.isMoving && this.isAIControlled) {
            this.drawableObject.stopAnimation();
        } else {
            this.drawableObject.startAnimation();
        }
    }
    this.updateRotations = function() {
        var targetAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.targetTilePosition);
        this.rotation = (180/Math.PI) * Math.atan2(targetAbsolutePosition.y - this.currentAbsolutePosition.y, targetAbsolutePosition.x - this.currentAbsolutePosition.x);
    }  

 	this.parseInput =  function(functionName, params) {

 	};
  	this.updateEnemy =  function(entity) {

  	};

    this.updateTargetTile = function(position) {
        this.targetTilePosition = position;
        this.updateRotations();
        this.isMoving = true;
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
  			if(!(entity.isDefender ^ this.isDefender)) {
  				continue;
  			}
  			var remX = entity.currentTilePosition.x - this.currentTilePosition.x;
  			var remY = entity.currentTilePosition.y - this.currentTilePosition.y;
  			var dest = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));
  			if(dest < minDistance) {
  				minDistance = dest;
  				nearestOpponent = entity;
  			}
  		}
  		if(nearestOpponent != null) {
  			if(minDistance <= this.range && !(this.isMoving && this.isAIControlled)) {
  				nearestOpponent.health -= 10;
                this.fireProjectile(nearestOpponent);
  				if(nearestOpponent.health <= 0) {
  					nearestOpponent.state = "dead";
  				}
  			}
  		} else {
            this.enemy = null;
        }
  	}
};

categories = { Attacker : 1, Defender : 2, Voyeur : 3 };

Player = function(name, id, numPlayersOnBoard) {
	this.name 	= name;
	this.id 	= id.toString();
	this.colorCode = numPlayersOnBoard;
	this.projectiles = new Array();
	this.battle = {state:"planning", whoami : categories.Defender};

	this.getUnits = function() {
		return this.units;
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
	}
};

Projectile = function(code, sourceEntity, targetEntity) {
    this.code = code;
    this.data = item_data[code];
    var startPosition = {
        x: sourceEntity.currentAbsolutePosition.x + (item_data[sourceEntity.code].type == "unit" ? globalUnitWidth/2 : globalTowerWidth/2),
        y: sourceEntity.currentAbsolutePosition.y + (item_data[sourceEntity.code].type == "unit" ? globalUnitHeight/2 : globalTowerHeight/2)
    };
    this.drawableObject = new DrawableObject('projectile', this.code, startPosition, this.data.width, this.data.height, this.data.frames -1, this);
    this.drawableObject.startAnimation();
    if(GLOBAL_PLATFORM == "web") GlobalAudio.play(this.data.sound);
    this.targetTilePosition = {
        x: targetEntity.currentTilePosition.x,
        y: targetEntity.currentTilePosition.y
    };
    var targetAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.targetTilePosition);
    this.drawableObject.setRotation((180/Math.PI) * Math.atan2(targetAbsolutePosition.y - sourceEntity.currentAbsolutePosition.y, targetAbsolutePosition.x - sourceEntity.currentAbsolutePosition.x));
    this.hasHit = false;
    this.lastMoved = new Date().getTime();
	console.log("add new projectile ");

	this.update = function(time) {         
		if(this && this.drawableObject ) {
            var currentTilePosition = MAP_CONFIG.convertAbsoluteToTile({x: this.drawableObject.getX(), y: this.drawableObject.getY()});

            var remX = this.targetTilePosition.x - currentTilePosition.x;
            var remY = this.targetTilePosition.y - currentTilePosition.y;

            var movableDist = this.data.speed * (time - this.lastMoved)/1000;
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));

			if(totalDist < 0.75) {
				this.hasHit = true;
                this.drawableObject.stopAnimation();
                this.drawableObject.remove();
                this.lastMoved = time;
				return false;
			} else if( movableDist < totalDist) {
                this.drawableObject.incrementPosition({
                    x: remX * TILE_LENGTH * (movableDist /  totalDist),
                    y: remY * TILE_BREADTH * (movableDist /  totalDist)
                });
                this.lastMoved = time;
				return true;
			}
            this.drawableObject.incrementPosition({
                x: remX * TILE_LENGTH,
                y: remY * TILE_BREADTH
            });
            this.lastMoved = time;
			return true;
		}      
	}
}

HealthBar = function(parentDrawableObject, type, initial, max, color) {
    
    this.maxHealth = max;

    this.initial = initial;

    switch(type) {
        case "unit": this.size = globalUnitWidth;break;
        case "tower": this.size = globalTowerWidth; break;
    }

    this.drawableBarDeath = new DrawableBar(this.size, "red");
    parentDrawableObject.addDrawableElement(this.drawableBarDeath);

    var lifeColor = "green";
    switch(color) {
        case 0: lifeColor = "green";
        case 1: lifeColor = "pink";
        case 2: lifeColor = "blue";
        case 3: lifeColor = "yellow";
    }

    this.drawableBarLife = new DrawableBar((this.initial/this.maxHealth) * this.size, lifeColor);
    parentDrawableObject.addDrawableElement(this.drawableBarLife);

    this.updateHealth = function (health) {
        this.drawableBarLife.setSize(this.size * (health/this.maxHealth));
    }
};