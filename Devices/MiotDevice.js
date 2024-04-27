const miio = require('miio')
const {debounceWithIndividualTimeout, buildCommandArgs} = require('../utils/Utils')

class MiotDevice {
    constructor(address, token, deviceId, debounce) {
        this.device = new miio.Device({address: address, token: token});
        this.deviceId = deviceId;
        this.debounce = debounce;
        if (debounce) {
            this.sendCommandDebounced = debounceWithIndividualTimeout(this.sendCommand, 50);
        }
    }

    setProperties(siid, piid, value) {
        if (this.debounce) {
            this.sendCommandDebounced(siid, piid, value);
        } else {
            this.sendCommand(siid, piid, value);
        }
    }

    sendCommandDebounced = debounceWithIndividualTimeout(this.sendCommand, 50);

    sendCommand(siid, piid, value) {
        this.device.call('set_properties', buildCommandArgs(this.deviceId, siid, piid, value)).then(res => {
            console.log(res);
        });
    }
}

module.exports = MiotDevice;
