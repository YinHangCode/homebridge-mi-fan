require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

ZhiMiFan = function(platform, config) {
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
        this.accessories['fanAccessory'] = new FanAccessory(this);
    }
    if(!this.config['temperatureDisable'] && this.config['temperatureName'] && this.config['temperatureName'] != "") {
        this.accessories['temperatureAccessory'] = new TemperatureAccessory(this);
    }
    if(!this.config['humidityDisable'] && this.config['humidityName'] && this.config['humidityName'] != "") {
        this.accessories['humidityAccessory'] = new HumidityAccessory(this);
    }
    if(!this.config['buzzerSwitchDisable'] && this.config['buzzerSwitchName'] && this.config['buzzerSwitchName'] != "") {
        this.accessories['buzzerSwitchAccessory'] = new BuzzerSwitchAccessory(this);
    }
    if(!this.config['ledBulbDisable'] && this.config['ledBulbName'] && this.config['ledBulbName'] != "") {
        this.accessories['ledBulbAccessory'] = new LEDBulbAccessory(this);
    }
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[MiFanPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(ZhiMiFan, Base);

FanAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['fanName'];
    this.platform = dThis.platform;
}

FanAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "ZhiMi Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var fanService = new Service.Fanv2(this.name);
    var activeCharacteristic = fanService.getCharacteristic(Characteristic.Active);
    var lockPhysicalControlsCharacteristic = fanService.addCharacteristic(Characteristic.LockPhysicalControls);
    var swingModeControlsCharacteristic = fanService.addCharacteristic(Characteristic.SwingMode);
    var rotationSpeedCharacteristic = fanService.addCharacteristic(Characteristic.RotationSpeed);
    var rotationDirectionCharacteristic = fanService.addCharacteristic(Characteristic.RotationDirection);

    // power
    activeCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["power"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Active - getActive: " + result);
                callback(null, result[0] === "on" ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.device.call("set_power", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Active - setActive Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(result[0]);
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Active - setActive Error: " + err);
                callback(err);
            });
        }.bind(this));
    
    // child_lock
    lockPhysicalControlsCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["child_lock"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - LockPhysicalControls - getLockPhysicalControls: " + result);
                callback(null, result[0] === "on" ? Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED : Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - LockPhysicalControls - getLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.device.call("set_child_lock", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - LockPhysicalControls - setLockPhysicalControls Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(result[0]);
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - LockPhysicalControls - setLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this));
        
    // angle_enable
    swingModeControlsCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["angle_enable"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - SwingMode - getSwingModeControls: " + result);
                callback(null, result[0] === "on" ? Characteristic.SwingMode.SWING_ENABLED : Characteristic.SwingMode.SWING_DISABLED);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - SwingMode - getSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.device.call("set_angle_enable", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - SwingMode - setSwingModeControls Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(result[0]);
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - SwingMode - setSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this));

    // natural_level speed_level
    rotationDirectionCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["natural_level"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationDirection - getRotationDirection: " + result);
                if(result[0] > 0) {
                    callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
                } else {
                    callback(null, Characteristic.RotationDirection.CLOCKWISE);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationDirection - getRotationDirection Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback, context) {
            if(Characteristic.RotationDirection.COUNTER_CLOCKWISE == value) {
                that.device.call("set_natural_level", [rotationSpeedCharacteristic.value]).then(result => {
                    that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationDirection - setRotationDirection Result: " + result);
                    if(result[0] === "ok") {
                        callback(null);
                    } else {
                        callback(result[0]);
                    }
                }).catch(function(err) {
                    that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationDirection - setRotationDirection Error: " + err);
                    callback(err);
                });
            } else {
                that.device.call("set_speed_level", [rotationSpeedCharacteristic.value]).then(result => {
                    that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationDirection - setRotationDirection Result: " + result);
                    if(result[0] === "ok") {
                        callback(null);
                    } else {
                        callback(result[0]);
                    }
                }).catch(function(err) {
                    that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationDirection - setRotationDirection Error: " + err);
                    callback(err);
                });
            }
        }.bind(this));

    // speed_level natural_level
    rotationSpeedCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["natural_level", "speed_level"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationSpeed - getRotationSpeed: " + result);
                if(result[0] > 0) {
                    callback(null, result[0]);
                } else {
                    callback(null, result[1]);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationSpeed - getRotationSpeed Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            if(value > 0) {
                if(Characteristic.RotationDirection.COUNTER_CLOCKWISE == rotationDirectionCharacteristic.value) {
                    that.device.call("set_natural_level", [value]).then(result => {
                        that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationSpeed - setRotationSpeed Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(result[0]);
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationSpeed - setRotationSpeed Error: " + err);
                        callback(err);
                    });
                } else {
                    that.device.call("set_speed_level", [value]).then(result => {
                        that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - RotationSpeed - setRotationSpeed Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(result[0]);
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - RotationSpeed - setRotationSpeed Error: " + err);
                        callback(err);
                    });
                }
            }
        }.bind(this));
    services.push(fanService);

    var batteryService = new Service.BatteryService();
    var batLowCharacteristic = batteryService.getCharacteristic(Characteristic.StatusLowBattery);
    var batLevelCharacteristic = batteryService.getCharacteristic(Characteristic.BatteryLevel);
    batLevelCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["battery"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Battery - getLevel: " + result);
                batLowCharacteristic.updateValue(result[0] < 20 ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
                callback(null, result[0]);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Battery - getLevel Error: " + err);
                callback(err);
            });
        }.bind(this));
    var batChargingStateCharacteristic = batteryService.getCharacteristic(Characteristic.ChargingState);
    batChargingStateCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["ac_power"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]FanAccessory - Battery - getChargingState: " + result);
                callback(null, result[0] === "on" ? Characteristic.ChargingState.CHARGING : Characteristic.ChargingState.NOT_CHARGING);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]FanAccessory - Battery - getChargingState Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(batteryService);

    return services;
}

TemperatureAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['temperatureName'];
    this.platform = dThis.platform;
}

TemperatureAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "ZhiMi Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var temperatureService = new Service.TemperatureSensor(this.name);
    temperatureService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getTemperature.bind(this))
    services.push(temperatureService);
    
    return services;
}

TemperatureAccessory.prototype.getTemperature = function(callback) {
    var that = this;
    this.device.call("get_prop", ["temp_dec"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]TemperatureAccessory - Temperature - getTemperature: " + result);
        callback(null, result[0] / 10);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]TemperatureAccessory - Temperature - getTemperature Error: " + err);
        callback(err);
    });
}

HumidityAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['humidityName'];
    this.platform = dThis.platform;
}

HumidityAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "ZhiMi Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var humidityService = new Service.HumiditySensor(this.name);
    humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', this.getHumidity.bind(this))
    services.push(humidityService);

    return services;
}

HumidityAccessory.prototype.getHumidity = function(callback) {
    var that = this;
    this.device.call("get_prop", ["humidity"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]HumidityAccessory - Humidity - getHumidity: " + result);
        callback(null, result[0]);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]HumidityAccessory - Humidity - getHumidity Error: " + err);
        callback(err);
    });
}

BuzzerSwitchAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['buzzerSwitchName'];
    this.platform = dThis.platform;
}

BuzzerSwitchAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "ZhiMi Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchService = new Service.Switch(this.name);
    switchService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getBuzzerState.bind(this))
        .on('set', this.setBuzzerState.bind(this));
    services.push(switchService);

    return services;
}

BuzzerSwitchAccessory.prototype.getBuzzerState = function(callback) {
    var that = this;
    this.device.call("get_prop", ["buzzer"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]BuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState: " + result);
        callback(null, result[0] === "on" ? 1 : 0);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]BuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState Error: " + err);
        callback(err);
    });
}

BuzzerSwitchAccessory.prototype.setBuzzerState = function(value, callback) {
    var that = this;
    that.device.call("set_buzzer", [value ? "on" : "off"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]BuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Result: " + result);
        if(result[0] === "ok") {
            callback(null);
        } else {
            callback(result[0]);
        }            
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]BuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Error: " + err);
        callback(err);
    });
}

LEDBulbAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['ledBulbName'];
    this.platform = dThis.platform;
}

LEDBulbAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "ZhiMi Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchLEDService = new Service.Lightbulb(this.name);
    var onCharacteristic = switchLEDService.getCharacteristic(Characteristic.On);
    var brightnessCharacteristic = switchLEDService.addCharacteristic(Characteristic.Brightness);
    
    onCharacteristic
        .on('get', function(callback) {
            this.device.call("get_prop", ["led_b"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]LEDBulbAccessory - switchLED - getLEDPower: " + result);
                if(result[0] == 0) {
                    brightnessCharacteristic.updateValue(100);
                } else if (result[0] == 1) {
                    brightnessCharacteristic.updateValue(50);
                } else if (result[0] == 2) {
                    brightnessCharacteristic.updateValue(0);
                }
                callback(null, result[0] === 0 ? 0 : 1);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]LEDBulbAccessory - switchLED - getLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            var led_b_value;
            if(value) {
                if(brightnessCharacteristic.value > 0 && brightnessCharacteristic.value <= 50) {
                    led_b_value = 1;
                } else if (brightnessCharacteristic.value > 50 && brightnessCharacteristic.value <= 100) {
                    led_b_value = 0;
                }
            } else {
                led_b_value = 2;
            }
            
            this.device.call("set_led_b", [led_b_value]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]LEDBulbAccessory - switchLED - setLEDPower Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(result[0]);
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]LEDBulbAccessory - switchLED - setLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this));
    brightnessCharacteristic
        .on('set', function(value, callback) {
            var led_b_value;
            if(value > 0 && value <= 50) {
                led_b_value = 1;
            } else if (value > 50 && value <= 100) {
                led_b_value = 0;
            }
            
            this.device.call("set_led_b", [led_b_value]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]LEDBulbAccessory - switchLED - setLEDPower Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(result[0]);
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]LEDBulbAccessory - switchLED - setLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(switchLEDService);

    return services;
}
