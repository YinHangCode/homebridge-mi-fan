require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

MiDCVariableFrequencyFan = function(platform, config) {
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
        this.accessories['fanAccessory'] = new MiDCVFFanFanAccessory(this);
    }
    if(!this.config['temperatureDisable'] && this.config['temperatureName'] && this.config['temperatureName'] != "") {
        this.accessories['temperatureAccessory'] = new MiDCVFFanTemperatureAccessory(this);
    }
    if(!this.config['humidityDisable'] && this.config['humidityName'] && this.config['humidityName'] != "") {
        this.accessories['humidityAccessory'] = new MiDCVFFanHumidityAccessory(this);
    }
    if(!this.config['buzzerSwitchDisable'] && this.config['buzzerSwitchName'] && this.config['buzzerSwitchName'] != "") {
        this.accessories['buzzerSwitchAccessory'] = new MiDCVFFanBuzzerSwitchAccessory(this);
    }
    if(!this.config['ledBulbDisable'] && this.config['ledBulbName'] && this.config['ledBulbName'] != "") {
        this.accessories['ledBulbAccessory'] = new MiDCVFFanLEDBulbAccessory(this);
    }
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[MiFanPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(MiDCVariableFrequencyFan, Base);

MiDCVFFanFanAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['fanName'];
    this.platform = dThis.platform;
}

MiDCVFFanFanAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Mi DC VF Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var fanService = new Service.Fanv2(this.name);
    var activeCharacteristic = fanService.getCharacteristic(Characteristic.Active);
    var lockPhysicalControlsCharacteristic = fanService.addCharacteristic(Characteristic.LockPhysicalControls);
    var swingModeControlsCharacteristic = fanService.addCharacteristic(Characteristic.SwingMode);
    var rotationSpeedCharacteristic = fanService.addCharacteristic(Characteristic.RotationSpeed);
    var rotationDirectionCharacteristic = fanService.addCharacteristic(Characteristic.RotationDirection);
    
    var currentTemperatureCharacteristic = fanService.addCharacteristic(Characteristic.CurrentTemperature);
    var currentRelativeHumidityCharacteristic = fanService.addCharacteristic(Characteristic.CurrentRelativeHumidity);

    // power
    activeCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["power"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - Active - getActive: " + result);
                callback(null, result[0] === "on" ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - Active - setActive: " + value);
            that.device.call("set_power", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - Active - setActive Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - Active - setActive Error: " + err);
                callback(err);
            });
        }.bind(this));
    
    // child_lock
    lockPhysicalControlsCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["child_lock"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - LockPhysicalControls - getLockPhysicalControls: " + result);
                callback(null, result[0] === "on" ? Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED : Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - LockPhysicalControls - getLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - LockPhysicalControls - setLockPhysicalControls: " + value);
            that.device.call("set_child_lock", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - LockPhysicalControls - setLockPhysicalControls Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - LockPhysicalControls - setLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this));
        
    // angle_enable
    swingModeControlsCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["angle_enable"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - SwingMode - getSwingModeControls: " + result);
                callback(null, result[0] === "on" ? Characteristic.SwingMode.SWING_ENABLED : Characteristic.SwingMode.SWING_DISABLED);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - SwingMode - getSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - SwingMode - setSwingModeControls: " + value);
            that.device.call("set_angle_enable", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - SwingMode - setSwingModeControls Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }            
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - SwingMode - setSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this));

    // natural_level speed_level
    rotationDirectionCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["natural_level"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationDirection - getRotationDirection: " + result);
                if(result[0] > 0) {
                    callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
                } else {
                    callback(null, Characteristic.RotationDirection.CLOCKWISE);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationDirection - getRotationDirection Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback, context) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationDirection - setRotationDirection: " + value);
            if(Characteristic.RotationDirection.COUNTER_CLOCKWISE == value) {
                that.device.call("set_natural_level", [rotationSpeedCharacteristic.value]).then(result => {
                    that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationDirection - setRotationDirection Result: " + result);
                    if(result[0] === "ok") {
                        callback(null);
                    } else {
                        callback(new Error(result[0]));
                    }
                }).catch(function(err) {
                    that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationDirection - setRotationDirection Error: " + err);
                    callback(err);
                });
            } else {
                that.device.call("set_speed_level", [rotationSpeedCharacteristic.value]).then(result => {
                    that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationDirection - setRotationDirection Result: " + result);
                    if(result[0] === "ok") {
                        callback(null);
                    } else {
                        callback(new Error(result[0]));
                    }
                }).catch(function(err) {
                    that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationDirection - setRotationDirection Error: " + err);
                    callback(err);
                });
            }
        }.bind(this));

    // speed_level natural_level
    rotationSpeedCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["natural_level", "speed_level"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationSpeed - getRotationSpeed: " + result);
                if(result[0] > 0) {
                    callback(null, result[0]);
                } else {
                    callback(null, result[1]);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationSpeed - getRotationSpeed Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationSpeed - setRotationSpeed: " + value);
            if(value > 0) {
                if(Characteristic.RotationDirection.COUNTER_CLOCKWISE == rotationDirectionCharacteristic.value) {
                    that.device.call("set_natural_level", [value]).then(result => {
                        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationSpeed - setRotationSpeed Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(new Error(result[0]));
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationSpeed - setRotationSpeed Error: " + err);
                        callback(err);
                    });
                } else {
                    that.device.call("set_speed_level", [value]).then(result => {
                        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - RotationSpeed - setRotationSpeed Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(new Error(result[0]));
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - RotationSpeed - setRotationSpeed Error: " + err);
                        callback(err);
                    });
                }
            }
        }.bind(this));

    currentTemperatureCharacteristic.on('get', function(callback) {
        this.device.call("get_prop", ["temp_dec"]).then(result => {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - Temperature - getTemperature: " + result);
            callback(null, result[0] / 10);
        }).catch(function(err) {
            that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - Temperature - getTemperature Error: " + err);
            callback(err);
        });
    }.bind(this));
        
    currentRelativeHumidityCharacteristic.on('get', function(callback) {
        this.device.call("get_prop", ["humidity"]).then(result => {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanFanAccessory - Humidity - getHumidity: " + result);
            callback(null, result[0]);
        }).catch(function(err) {
            that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanFanAccessory - Humidity - getHumidity Error: " + err);
            callback(err);
        });
    }.bind(this));
    services.push(fanService);

    return services;
}

MiDCVFFanTemperatureAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['temperatureName'];
    this.platform = dThis.platform;
}

MiDCVFFanTemperatureAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Mi DC VF Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var temperatureService = new Service.TemperatureSensor(this.name);
    temperatureService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getTemperature.bind(this))
    services.push(temperatureService);
    
    return services;
}

MiDCVFFanTemperatureAccessory.prototype.getTemperature = function(callback) {
    var that = this;
    this.device.call("get_prop", ["temp_dec"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanTemperatureAccessory - Temperature - getTemperature: " + result);
        callback(null, result[0] / 10);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanTemperatureAccessory - Temperature - getTemperature Error: " + err);
        callback(err);
    });
}

MiDCVFFanHumidityAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['humidityName'];
    this.platform = dThis.platform;
}

MiDCVFFanHumidityAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Mi DC VF Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var humidityService = new Service.HumiditySensor(this.name);
    humidityService
        .getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', this.getHumidity.bind(this))
    services.push(humidityService);

    return services;
}

MiDCVFFanHumidityAccessory.prototype.getHumidity = function(callback) {
    var that = this;
    this.device.call("get_prop", ["humidity"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanHumidityAccessory - Humidity - getHumidity: " + result);
        callback(null, result[0]);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanHumidityAccessory - Humidity - getHumidity Error: " + err);
        callback(err);
    });
}

MiDCVFFanBuzzerSwitchAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['buzzerSwitchName'];
    this.platform = dThis.platform;
}

MiDCVFFanBuzzerSwitchAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Mi DC VF Fan")
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

MiDCVFFanBuzzerSwitchAccessory.prototype.getBuzzerState = function(callback) {
    var that = this;
    this.device.call("get_prop", ["buzzer"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState: " + result);
        callback(null, result[0] === "on" ? 1 : 0);
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState Error: " + err);
        callback(err);
    });
}

MiDCVFFanBuzzerSwitchAccessory.prototype.setBuzzerState = function(value, callback) {
    var that = this;
    that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - BuzzerSwitch - setBuzzerState: " + value);
    that.device.call("set_buzzer", [value ? "on" : "off"]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanBuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Result: " + result);
        if(result[0] === "ok") {
            callback(null);
        } else {
            callback(new Error(result[0]));
        }            
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanBuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Error: " + err);
        callback(err);
    });
}

MiDCVFFanLEDBulbAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['ledBulbName'];
    this.platform = dThis.platform;
}

MiDCVFFanLEDBulbAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "Mi DC VF Fan")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var switchLEDService = new Service.Lightbulb(this.name);
    var onCharacteristic = switchLEDService.getCharacteristic(Characteristic.On);
    var brightnessCharacteristic = switchLEDService.addCharacteristic(Characteristic.Brightness);
    
    onCharacteristic
        .on('get', function(callback) {
            this.device.call("get_prop", ["led_b"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - switchLED - getLEDPower: " + result);
                callback(null, result[0] === 2 ? false : true);
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanLEDBulbAccessory - switchLED - getLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - switchLED - setLEDPower: " + value + ", nowValue: " + onCharacteristic.value);
            that.setLedB(value ? that.getLevelByBrightness(brightnessCharacteristic.value) : 2, callback);
        }.bind(this));
    brightnessCharacteristic
        .on('get', function(callback) {
            this.device.call("get_prop", ["led_b"]).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - switchLED - getLEDPower: " + result);
                if(result[0] == 0) {
                    if(brightnessCharacteristic.value > 50 && brightnessCharacteristic.value <= 100) {
                        callback(null, brightnessCharacteristic.value);
                    } else {
                        callback(null, 100);
                    }
                } else if(result[0] == 1) {
                    if(brightnessCharacteristic.value > 0 && brightnessCharacteristic.value <= 50) {
                        callback(null, brightnessCharacteristic.value);
                    } else {
                        callback(null, 50);
                    }
                } else if(result[0] == 2) {
                    callback(null, 0);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanLEDBulbAccessory - switchLED - getLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(switchLEDService);

    return services;
}

MiDCVFFanLEDBulbAccessory.prototype.setLedB = function(led_b, callback) {
    var that = this;
    that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - switchLED - setLedB: " + led_b);
    this.device.call("set_led_b", [led_b]).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]MiDCVFFanLEDBulbAccessory - switchLED - setLEDBrightness Result: " + result);
        if(result[0] === "ok") {
            callback(null);
        } else {
            callback(new Error(result[0]));
        }
    }).catch(function(err) {
        that.platform.log.error("[MiFanPlatform][ERROR]MiDCVFFanLEDBulbAccessory - switchLED - setLEDBrightness Error: " + err);
        callback(err);
    });
}

MiDCVFFanLEDBulbAccessory.prototype.getLevelByBrightness = function(brightness) {
    if(brightness == 0) {
        return 2;
    } else if(brightness > 0 && brightness <= 50) {
        return 1;
    } else if (brightness > 50 && brightness <= 100) {
        return 0;
    }
}
