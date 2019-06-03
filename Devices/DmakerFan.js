require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

DmakerFan = function(platform, config) {
    this.init(platform, config);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
    
    this.device = new miio.Device({
        address: this.config['ip'],
        token: this.config['token']
    });
    
    this.accessories = {};
    if(!this.config['fanDisable'] && this.config['fanName'] && this.config['fanName'] != "") {
        this.accessories['fanAccessory'] = new DmakerFanAccessory(this);
    }
	
    if(!this.config['ledBulbDisable'] && this.config['ledBulbName'] && this.config['ledBulbName'] != "") {
        this.accessories['ledBulbAccessory'] = new DmakerFanLEDBulbAccessory(this);
    }
	
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[MiFanPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(DmakerFan, Base);

DmakerFanAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['fanName'];
    this.platform = dThis.platform;
}

DmakerFanAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "DmakerFan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var fanService = new Service.Fanv2(this.name);
    var activeCharacteristic = fanService.getCharacteristic(Characteristic.Active);
    //var lockPhysicalControlsCharacteristic = fanService.addCharacteristic(Characteristic.LockPhysicalControls);
    var swingModeControlsCharacteristic = fanService.addCharacteristic(Characteristic.SwingMode);
    var rotationSpeedCharacteristic = fanService.addCharacteristic(Characteristic.RotationSpeed);
    var rotationDirectionCharacteristic = fanService.addCharacteristic(Characteristic.RotationDirection);

    activeCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["all"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - Active - getActive: " + result);
                if (result[0] === true) {
		    callback(null, Characteristic.Active.ACTIVE);
		} else {
		    callback(null, Characteristic.Active.INACTIVE);
		}
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - Active - setActive: " + value);
		if (Characteristic.Active.ACTIVE === value) {
		    that.device.call("s_power", ["true"]).then(result => {
		    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - Active - setActive Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
			    setTimeout(() => {
				activeCharacteristic.updateValue(1);
                            }, 10);
                        } else {
                            callback(new Error(result[0]));
                        }
		    }).catch(function(err) {
			that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - Active - setActive Error: " + err);
                        callback(err);
		    });
	         } else {
                    that.device.call("s_power", ["false"]).then(result => {
			that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - Active - setActive Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
			    setTimeout(() => {
				activeCharacteristic.updateValue(0);
                            }, 10);
                        } else {
                            callback(new Error(result[0]));
                        }
		     }).catch(function(err) {
			that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - Active - setActive Error: " + err);
                        callback(err);
                    });
		}
	}.bind(this));
        
    // angle_enable
    swingModeControlsCharacteristic
        .on('get', function(callback) {
	    that.device.call("get_prop", ["all"]).then(result => {
		that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - SwingMode - getSwingModeControls: " + result);
		if (result[3] === true) {
			callback(null, Characteristic.SwingMode.SWING_ENABLED);
		} else {
			callback(null, Characteristic.SwingMode.SWING_DISABLED);
		}
	    }).catch(function(err) {
	        that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - SwingMode - getSwingModeControls Error: " + err);
                callback(err);
            });
         }.bind(this))
         .on('set', function(value, callback) {	
		that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - SwingMode - setSwingModeControls: " + value);
                if (Characteristic.SwingMode.SWING_ENABLED === value) {
		    that.device.call("s_roll", ["true"]).then(result => {
		        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - SwingMode - setSwingModeControls Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
			    setTimeout(() => {
				swingModeControlsCharacteristic.updateValue(Characteristic.SwingMode.SWING_ENABLED);
                             }, 10);
                        } else {
                            callback(new Error(result[0]));
                        }
		    }).catch(function(err) {
			that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - SwingMode - setSwingModeControls Error: " + err);
                        callback(err);
		    });
		 } else {
                    that.device.call("s_roll", ["false"]).then(result => {
			that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - SwingMode - setSwingModeControls Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
			    setTimeout(() => {
				swingModeControlsCharacteristic.updateValue(Characteristic.SwingMode.SWING_DISABLED);
                            }, 10);
                        } else {
                            callback(new Error(result[0]));
                        }
		    }).catch(function(err) {
			that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - SwingMode - setSwingModeControls Error: " + err);
                        callback(err);
                    });
		}
	    }.bind(this));

    
    rotationSpeedCharacteristic
        .on('get', function(callback) {
	    that.device.call("get_prop", ["all"]).then(result => {
	        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationSpeed - getRotationSpeed: " + result);
		callback(null, result[2]);
	      }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - RotationSpeed - getRotationSpeed Error: " + err);  
                callback(err);
            });
	}.bind(this))
        .on('set', function(value, callback) {
	    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationSpeed - setRotationSpeed: " + value);
	    that.device.call("s_speed", [value]).then(result => {
		that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationSpeed - setRotationSpeed Result: " + result);
		if(result[0] === "ok") {
                    callback(null);
	        } else {
                    callback(new Error(result[0]));
                }
	     }).catch(function(err) {
		that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - RotationSpeed - setRotationSpeed Error: " + err);
                callback(err);
            });
	}.bind(this));
    
	rotationDirectionCharacteristic
	    .on('get', function(callback) {
		that.device.call("get_prop", ["all"]).then(result => {
		    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationDirection - getRotationDirection: " + result);
	            if (result[1] === "normal") {
			callback(null, Characteristic.RotationDirection.CLOCKWISE);
		    } else {
			 callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
		     }
		 }).catch(function(err) {
	           that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - RotationDirection - getRotationDirection Error: " + err);
                   callback(err);
                });
             }.bind(this))
	     .on('set', function(value, callback) {
		 that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationDirection - setRotationDirection: " + value);
		 if (Characteristic.RotationDirection.CLOCKWISE === value) {
			that.device.call("s_mode", ["normal"]).then(result => {
			that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationDirection - setRotationDirection Result: " + result);
                            if(result[0] === "ok") {
                                callback(null);
				setTimeout(() => {
				    rotationDirectionCharacteristic.updateValue(Characteristic.RotationDirection.CLOCKWISE);
                                }, 10);
                             } else {
                                callback(new Error(result[0]));
                             }
			 }).catch(function(err) {
			    that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - RotationDirection - setRotationDirection Error: " + err);
                            callback(err);
			 });
		  } else {
                     that.device.call("s_mode", ["nature"]).then(result => {
			that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanAccessory - RotationDirection - setRotationDirection Result: " + result);
                        if(result[0] === "ok") {
                             callback(null);
			     setTimeout(() => {
				 rotationDirectionCharacteristic.updateValue(Characteristic.RotationDirection.COUNTER_CLOCKWISE);
                             }, 10);
                        } else {
                            callback(new Error(result[0]));
                        }
		    }).catch(function(err) {
			that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanAccessory - RotationDirection - setRotationDirection Error: " + err);
                        callback(err);
                    });
		}
	}.bind(this));
    
    services.push(fanService);

    return services;
}

DmakerFanLEDBulbAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['ledBulbName'];
    this.platform = dThis.platform;
}

DmakerFanLEDBulbAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "DmakerFan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchService = new Service.Switch(this.name);
    switchService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getLEDBulbState.bind(this))
        .on('set', this.setLEDBulbState.bind(this));
    services.push(switchService);

    return services;
}

DmakerFanLEDBulbAccessory.prototype.getLEDBulbState = function(callback) {
    var that = this;
    this.device.call("get_prop", ["all"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanLEDBulbAccessory - ledBulb - getLEDBulbState: " + result);
        if (result[6] === true) {
			callback(null, true);
		} else {
			callback(null, false);
		}
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanLEDBulbAccessory - ledBulb - getLEDBulbState Error: " + err);
        callback(err);
    });
}

DmakerFanLEDBulbAccessory.prototype.setLEDBulbState = function(value, callback) {
    var that = this;
    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanLEDBulbAccessory - ledBulb - setLEDBulbState: " + value);
    that.device.call("s_light", [value ? "true" : "false"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanLEDBulbAccessory - ledBulb - setLEDBulbState Result: " + result);
        if(result[0] === "ok") {
            callback(null);
        } else {
            callback(new Error(result[0]));
        }            
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanLEDBulbAccessory - ledBulb - setLEDBulbState Error: " + err);
        callback(err);
    });
}



