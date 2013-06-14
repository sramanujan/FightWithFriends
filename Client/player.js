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
  this.dragged = false;
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
    this.mouseUp = function(position) {
        this.targetTilePosition = MAP_CONFIG.convertAbsoluteToTile(position);
        this.dragged = true;
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
    this.healthBar = new HealthBar(this.mapResource, globalTowerWidth, 0, this.maxHealth, 0);
    this.proImgObject = unitProjectileImages[this.code];
/*************** GRAPHICS *************/    
    
    this.proSpeed = item_data[this.code].projectileSpeed;
    this.hitsPerSecond = item_data[this.code].hitsPerSecond;
    this.fireProjectile = function(target) {
      if(this.lastProjectileFiredTime != null && ((new Date().getTime() - this.lastProjectileFiredTime)/1000 < 1/this.hitsPerSecond)) {
        return;
      }

/*************** GRAPHICS *************/   
      projectiles.push(new Projectile( this, target, this.proImgObject, { width: item_data[this.code].projectileWidth, height: item_data[this.code].projectileHeight, speed: item_data[this.code].projectileSpeed }));
/*************** GRAPHICS *************/        

      this.lastProjectileFiredTime = new Date().getTime();
    }



    this.update =function() {
        var time = new Date().getTime();
		//If unit has reached its target position, update target to goal
        if(this.targetTilePosition.x == this.currentTilePosition.x && this.targetTilePosition.y == this.currentTilePosition.y && isAIControlled) {
            this.targetTilePosition.x = 14;
            this.targetTilePosition.y = 7;
            this.dragged = false;
		}
		if(!this.isAIControlled) {
			this.currentTilePosition = this.targetTilePosition;
		}
		else {
            if(this.fixed == true && this.dragged == false) {
              return false;
            }
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
  	};

/*************** GRAPHICS *************/
    this.updateMapResource = function() {
        if(this.state == "dead") {
            this.mapResource.remove();
            return false;
        }
        this.currentAbsolutePosition = MAP_CONFIG.convertTileToAbsolute(this.currentTilePosition);
        this.mapResource.x = this.currentAbsolutePosition.x;
        this.mapResource.y = this.currentAbsolutePosition.y;
    }
/*************** GRAPHICS *************/    

 	this.parseInput =  function(functionName, params) {

 	};
  	this.updateEnemy =  function(entity) {

  	};



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
  			if(minDistance <= this.range) {
          this.fixed = true;
  				nearestOpponent.health -= 10;
                this.fireProjectile(nearestOpponent);
  				if(nearestOpponent.health <= 0) {
            this.fixed = false;
  					nearestOpponent.state = "dead";
  				}
  			}
        else {
            this.fixed = false;
            this.enemy = null;
        }
  		} else {
            this.fixed = false;
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
	}
};

Projectile = function( sourceEntity, targetEntity, imgObject, projectileData) {
	this.projectileData = projectileData;
    this.drawableObject = new DrawableObject('projectile', sourceEntity.currentAbsolutePosition, projectileData.width, projectileData.height, imgObject);
    this.targetTilePosition = {
        x: targetEntity.currentTilePosition.x,
        y: targetEntity.currentTilePosition.y
    };
    this.hasHit = false;
    this.lastMoved = new Date().getTime();
	console.log("add new projectile ");

	this.update = function(time) {         
		if(this && this.drawableObject ) {
            var currentTilePosition = MAP_CONFIG.convertAbsoluteToTile({x: this.drawableObject.getX(), y: this.drawableObject.getY()});

            var remX = this.targetTilePosition.x - currentTilePosition.x;
            var remY = this.targetTilePosition.y - currentTilePosition.y;

            var movableDist = this.projectileData.speed * (time - this.lastMoved)/1000;
			var totalDist = Math.sqrt(Math.pow(remX, 2) + Math.pow(remY, 2));

			if(totalDist < 0.25) {
				this.hasHit = true;
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

HealthBar = function(parentResource, size, initial, max, color) {
    this.maxHealth = max;
    this.size = size;
    this.initial = initial;

/*************** GRAPHICS *************/          
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
/*************** GRAPHICS *************/      

};