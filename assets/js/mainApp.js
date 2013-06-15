var LoginSprite = cc.Sprite.extend({

});

var AddTowerButton = cc.Sprite.extend({

});

var AddUnitButton = cc.Sprite.extend({

})

var TopHud = cc.Sprite.extend({
    ctor:function () {
        this._super();

        this.hud = cc.Sprite.create("assets/img/health_green.png");
        this.setContentSize(this.hud.getContentSize());
        this.addChild(this.hud, 0);

                // add a "close" icon to exit the progress. it's an autorelease object
        this.addUnitButton = cc.MenuItemImage.create(
            "assets/img/add_unit_button.png",
            "assets/img/add_unit_button_pressed.png",
            "assets/img/add_unit_button_disabled.png",
            function () {
                console.log("Clicked on add unit button!!!");
                this.setUnitMenu();
            },this);
        this.addUnitButton.setAnchorPoint(cc.p(0.5, 0.5));


        this.addTowerButton = cc.MenuItemImage.create(
            "assets/img/add_tower_button.png",
            "assets/img/add_tower_button_pressed.png",
            "assets/img/add_tower_button_disabled.png",
            function () {
                console.log("Clicked on add tower button!!!");
                this.setTowerMenu();
            },this);
        this.addTowerButton.setAnchorPoint(cc.p(0.5, 0.5));


        this.joinRoomButton = cc.MenuItemImage.create(
            "assets/img/attack_button.png",
            "assets/img/attack_button_pressed.png",
            "assets/img/attack_button_disabled.png",
            function () {
                console.log("Clicked on add join room button!!!");
                this.setJoinMenu();
            },this);
        this.joinRoomButton.setAnchorPoint(cc.p(0.5, 0.5));

        this.leaveRoomButton = cc.MenuItemImage.create(
            "assets/img/go_home_button.png",
            "assets/img/go_home_button_pressed.png",
            "assets/img/go_home_button_disabled.png",
            function () {
                console.log("Clicked on add leave room button!!!");
            },this);
        this.leaveRoomButton.setAnchorPoint(cc.p(0.5, 0.5));

        this.menu = cc.Menu.create();
        this.menu.setPosition(cc.PointZero());
    },
    init:function () {

        this.addChild(this.menu, 1);
        this.addUnitButton.setPosition(cc.p(70 - this.getContentSize().width / 2, -this.getContentSize().height / 4));
        this.addTowerButton.setPosition(cc.p(this.getContentSize().width / 2 - 70, -this.getContentSize().height / 4));
        this.joinRoomButton.setPosition(cc.p(this.getContentSize().width / 2 - 70, this.getContentSize().height / 4));
        this.leaveRoomButton.setPosition(cc.p(70 - this.getContentSize().width / 2, this.getContentSize().height / 4));
        this.setDefaultMenu();

        //scale the hud and put menut in appropriate place.
        console.log("init...");
    },
    setDefaultMenu:function () {
        this.menu.removeAllChildren();
        this.menu.addChild(this.addUnitButton);
        this.menu.addChild(this.addTowerButton);
        this.menu.addChild(this.joinRoomButton);
        this.menu.addChild(this.leaveRoomButton);
    },
    setUnitMenu:function () {
        this.menu.removeAllChildren();
        var start = 70;
        var add = 140;
        for (var i = 0; i < usableUnitCodes.length; i++) {
            var code = usableUnitCodes[i];
            var label = cc.LabelTTF.create(unit_data[usableUnitCodes[i]].name, "Calibri", 14);
            label.setColor(new cc.Color3B(0,0,0));
            var unitButton = cc.MenuItemLabel.create(label, function() {
                addUnit({code : code, position : { x: 0.100, y: 0.30 }});
                console.log("Came into unit selection with " + code);
            });
            unitButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
            this.menu.addChild(unitButton);
        }
        var label = cc.LabelTTF.create("Back", "Calibri", 14);
        label.setColor(new cc.Color3B(0,0,0));
        var backButton = cc.MenuItemLabel.create(label, function() {
            this._parent._parent.setDefaultMenu();
        });
        backButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
        this.menu.addChild(backButton);
    },
    setTowerMenu:function () {
        this.menu.removeAllChildren();
        var start = 70;
        var add = 140;
        for (var i = 0; i < usableTowerCodes.length; i++) {
            var code = usableTowerCodes[i];
            var label = cc.LabelTTF.create(tower_data[usableTowerCodes[i]].name, "Calibri", 14);
            label.setColor(new cc.Color3B(0,0,0));
            var towerButton = cc.MenuItemLabel.create(label, function() {
                console.log("Came into unit selection with " + code);
                addTower({code : code, position : { x: 0.100, y: 0.30 }}, me.id);
            });
            towerButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
            this.menu.addChild(towerButton);
        }        
        var label = cc.LabelTTF.create("Back", "Calibri", 14);
        label.setColor(new cc.Color3B(0,0,0));
        var backButton = cc.MenuItemLabel.create(label, function() {
            this._parent._parent.setDefaultMenu();
        });
        backButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
        this.menu.addChild(backButton);        
    },
    setJoinMenu:function () {
        this.menu.removeAllChildren();
        var start = 70;
        var add = 140;
        i = 0;
        for (var roomName in listOfRooms) {
            roomName = roomName.replace('/','');
            if (!roomName || roomName == myRoom) {
                continue;
            }
            var label = cc.LabelTTF.create(roomName, "Calibri", 14);
            label.setColor(new cc.Color3B(0,0,0));
            var roomButton = cc.MenuItemLabel.create(label, function() {
                joinRoom(roomName);
                console.log("Came into unit selection with " + roomName);
            });
            roomButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
            this.menu.addChild(roomButton);   
            i++;         
        }
        var label = cc.LabelTTF.create("Back", "Calibri", 14);
        label.setColor(new cc.Color3B(0,0,0));
        var backButton = cc.MenuItemLabel.create(label, function() {
            this._parent._parent.setDefaultMenu();
        });
        backButton.setPosition(cc.p(70 + (i*140) - this.getContentSize().width / 2, 0));
        this.menu.addChild(backButton);        
    },
    draw:function () {
        if (checkButtons) {
            if (whoami == categories.Attacker) {
                this.joinRoomButton.setEnabled(false);
                this.addTowerButton.setEnabled(false);
                this.leaveRoomButton.setEnabled(true);
                this.addUnitButton.setEnabled(true);
            }
            else {
                this.joinRoomButton.setEnabled(true);
                this.addTowerButton.setEnabled(true);
                this.leaveRoomButton.setEnabled(false);
                this.addUnitButton.setEnabled(false);
            }
            checkButtons = false;
        }
    }
});
var MainLayer = cc.Layer.extend({
    isMouseDown:false,
    //helloImg:null,
    //helloLabel:null,
    //circle:null,
    sprite:null,

    init:function () {
        var selfPointer = this;

        this._super();

        var size = cc.Director.getInstance().getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            "assets/img/CloseNormal.png",
            "assets/img/CloseSelected.png",
            function () {
                history.go(-1);
            },this);
        closeItem.setAnchorPoint(cc.p(0.5, 0.5));

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(cc.PointZero());
        this.addChild(menu, 1);
        closeItem.setPosition(cc.p(size.width - 20, 20));


/*
        this.helloLabel = cc.LabelTTF.create("Hello World", "Calibri", 38);
        // position the label on the center of the screen
        this.helloLabel.setPosition(cc.p(size.width / 2, 0));
        // add the label as a child to this layer
        this.addChild(this.helloLabel, 5);
        */

        var hudLayer = cc.Layer.create();
        this.addChild(hudLayer);

        var mainLayer = cc.Layer.create();
        this.addChild(mainLayer);

        this.topHud = new TopHud();
        this.topHud.setPosition(cc.p(size.width / 2, (0.85 + 0.15/2) * size.height));
        var scaleToA1 = cc.ScaleTo.create(2, (this.getContentSize().width/this.topHud.getContentSize().width), (0.15*this.getContentSize().height/this.topHud.getContentSize().height));
        this.topHud.runAction(cc.Sequence.create(scaleToA1));
        this.topHud.init();
        mainLayer.addChild(this.topHud, 0);

        this.sprite = cc.Sprite.create("assets/img/background_map_4.png");
        this.sprite.setPosition(cc.p(size.width / 2, (0.85/2) * size.height));
        this.sprite.setScale(0.1);
        this.sprite.setRotation(180);
        mainLayer.addChild(this.sprite, 0);
        var rotateToA = cc.RotateTo.create(2, 0);
        var scaleToA = cc.ScaleTo.create(2, (this.getContentSize().width/this.sprite.getContentSize().width), (0.85*this.getContentSize().height/this.sprite.getContentSize().height));
        this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));

        //this.helloLabel.runAction(cc.Spawn.create(cc.MoveBy.create(2.5, cc.p(0, size.height - 40)),cc.TintTo.create(2.5,255,125,0)));
        this.setTouchEnabled(true);
        return true;
    },
    // a selector callback
    menuCloseCallback:function (sender) {
        cc.Director.getInstance().end();
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
            }
        }
    },
    onTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }
});

var MainScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainLayer();
        layer.init();
        this.addChild(layer);
    }
});

