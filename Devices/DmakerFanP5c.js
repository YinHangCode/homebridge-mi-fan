require('./Base');
const inherits = require('util').inherits;
const MiotDevice = require('./MiotDevice')

let Accessory, PlatformAccessory, Service, Characteristic, UUIDGen, deviceId;


DmakerFanP5c = function (platform, config) {
    this.init(platform, config);
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;

    this.device = new MiotDevice(
        this.config['ip'],
        this.config['token'],
        this.config['debounce'] || false,
        this.platform.log,
        this.config['deviceId'],
        this.config['wait'] || 50);

    this.accessories = {};
    if (!this.config['fanDisable'] && this.config['fanName'] && this.config['fanName'] !== "") {
        this.accessories['fanAccessory'] = new DmakerFanP5cAccessory(this);
    }
    if (this.config['deviceId'] && this.config['deviceId'] !== "") {
        deviceId = this.config['deviceId']
    }

    if (!this.config['ledBulbDisable'] && this.config['ledBulbName'] && this.config['ledBulbName'] !== "") {
        this.accessories['ledBulbAccessory'] = new DmakerFanP5cLEDBulbAccessory(this);
    }

    if (!this.config['buzzerSwitchDisable'] && this.config['buzzerSwitchName'] && this.config['buzzerSwitchName'] !== "") {
        this.accessories['buzzerSwitchAccessory'] = new DmakerFanP5cBuzzerSwitchAccessory(this);
    }

    var accessoriesArr = this.obj2array(this.accessories);

    this.platform.log.debug("[MiFanPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);

    return accessoriesArr;
}
inherits(DmakerFanP5c, Base);

DmakerFanP5cAccessory = function (dThis) {
    this.device = dThis.device;
    this.name = dThis.config['fanName'];
    this.platform = dThis.platform;
}

DmakerFanP5cAccessory.prototype.getServices = function () {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "DmakerFanP5c")
        .setCharacteristic(Characteristic.SerialNumber, "undefined");
    services.push(infoService);

    var fanService = new Service.Fanv2(this.name);
    var activeCharacteristic = fanService.getCharacteristic(Characteristic.Active);
    var lockPhysicalControlsCharacteristic = fanService.addCharacteristic(Characteristic.LockPhysicalControls);
    var swingModeControlsCharacteristic = fanService.addCharacteristic(Characteristic.SwingMode);
    var rotationSpeedCharacteristic = fanService.addCharacteristic(Characteristic.RotationSpeed);
    var rotationDirectionCharacteristic = fanService.addCharacteristic(Characteristic.RotationDirection);

    activeCharacteristic
        .on('get', function (callback) {
            that.device.getProperty(2, 1).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - Active - getActive: " + JSON.stringify(result));
                if (result.code === 0 && result.value === true) {
                    callback(null, Characteristic.Active.ACTIVE);
                } else {
                    callback(null, Characteristic.Active.INACTIVE);
                }
            }).catch(function (err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanP5cAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function (value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - Active - setActive: " + value);
            that.device.setProperty(2, 1, value);
            callback(null)
        }.bind(this));

    lockPhysicalControlsCharacteristic
        .on('get', function (callback) {
            that.device.getProperty(7, 1).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - LockPhysicalControls - getLockPhysicalControls: " + JSON.stringify(result));
                if (result.value === true) {
                    callback(null, Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED);
                } else {
                    callback(null, Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
                }
            }).catch(function (err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanP5cAccessory - LockPhysicalControls - getLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function (value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - LockPhysicalControls - setLockPhysicalControls: " + value);
            that.device.setProperty(7, 1, value)
            callback(null)
        }.bind(this));

    // angle_enable
    swingModeControlsCharacteristic
        .on('get', function (callback) {
            that.device.getProperty(2, 4).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - SwingMode - getSwingModeControls: " + JSON.stringify(result));
                if (result.code === 0 && result.value === true) {
                    callback(null, Characteristic.SwingMode.SWING_ENABLED);
                } else {
                    callback(null, Characteristic.SwingMode.SWING_DISABLED);
                }
            }).catch(function (err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanP5cAccessory - SwingMode - getSwingModeControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function (value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - SwingMode - setSwingModeControls: " + value);
            that.device.setProperty(2, 4, value);
            callback(null)
        }.bind(this));


    rotationSpeedCharacteristic
        .on('get', function (callback) {
            that.device.getProperty(8, 1).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - RotationSpeed - getRotationSpeed: " + JSON.stringify(result));
                callback(null, result.value);
            }).catch(function (err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanP5cAccessory - RotationSpeed - getRotationSpeed Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function (value, callback) {

            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - RotationSpeed - setRotationSpeed: " + value);
            that.device.setProperty(8, 1, value);
            callback(null);
        }.bind(this));

    rotationDirectionCharacteristic
        .on('get', function (callback) {
            that.device.getProperty(2, 3).then(result => {
                that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - RotationDirection - getRotationDirection: " + JSON.stringify(result));
                if (result.value === 0) {
                    callback(null, Characteristic.RotationDirection.CLOCKWISE);
                } else {
                    callback(null, Characteristic.RotationDirection.COUNTER_CLOCKWISE);
                }
            }).catch(function (err) {
                that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanP5cAccessory - RotationDirection - getRotationDirection Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function (value, callback) {
            that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanP5cAccessory - RotationDirection - setRotationDirection: " + value);
            that.device.setProperty(2, 3, value);
            callback(null);
        }.bind(this));

    services.push(fanService);

    return services;
}

DmakerFanP5cLEDBulbAccessory = function (dThis) {
    this.device = dThis.device;
    this.name = dThis.config['ledBulbName'];
    this.platform = dThis.platform;
}

DmakerFanP5cLEDBulbAccessory.prototype.getServices = function () {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "DmakerFanP5c")
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

DmakerFanP5cLEDBulbAccessory.prototype.getLEDBulbState = function (callback) {
    var that = this;
    this.device.getProperty(4, 1).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanLEDBulbAccessory - ledBulb - getLEDBulbState: " + JSON.stringify(result));
        if (result.value === true) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    }).catch(function (err) {
        that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanLEDBulbAccessory - ledBulb - getLEDBulbState Error: " + err);
        callback(err);
    });
}

DmakerFanP5cLEDBulbAccessory.prototype.setLEDBulbState = function (value, callback) {
    var that = this;

    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanLEDBulbAccessory - ledBulb - setLEDBulbState: " + value);
    that.device.setProperty(4, 1, value);
    callback(null)
}

DmakerFanP5cBuzzerSwitchAccessory = function (dThis) {
    this.device = dThis.device;
    this.name = dThis.config['buzzerSwitchName'];
    this.platform = dThis.platform;
}

DmakerFanP5cBuzzerSwitchAccessory.prototype.getServices = function () {
    var services = [];
    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "DmakerFanP5c")
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

DmakerFanP5cBuzzerSwitchAccessory.prototype.getBuzzerState = function (callback) {
    var that = this;

    this.device.getProperty(5, 1).then(result => {
        that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState: " + JSON.stringify(result));
        if (result.value === true) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    }).catch(function (err) {
        that.platform.log.error("[MiFanPlatform][ERROR]DmakerFanBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState Error: " + err);
        callback(err);
    });
}

DmakerFanP5cBuzzerSwitchAccessory.prototype.setBuzzerState = function (value, callback) {
    var that = this;

    that.platform.log.debug("[MiFanPlatform][DEBUG]DmakerFanBuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState: " + value);
    that.device.setProperty(5, 1, value);
    callback(null)
}

