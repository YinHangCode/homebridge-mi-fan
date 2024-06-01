const miio = require('miio')

class MiotDevice {
    setMethod = "set_properties";
    getMethod = "get_properties";

    constructor(address, token, debounce, log, deviceId, wait) {
        this.device = new miio.Device({address: address, token: token});
        this.deviceId = deviceId;
        this.debounce = debounce;
        this.log = log || console;
        if (debounce) {
            this.sendCommandDebounced = this.debounceWithIndividualTimeout(this.sendCommand, wait || 50);
        }
    }


    setProperty(siid, piid, value) {
        let execute;
        if (this.debounce) {
            execute = this.sendCommandDebounced(this.setMethod, siid, piid, value)
        } else {
            execute = this.sendCommand(this.setMethod, siid, piid, value)
        }
        execute.then(result => {
            this.log.debug(`[MiFanPlatform][DEBUG]DmakerFanP5c ====>result:` + JSON.stringify(result[0]));
        }).catch(err => {
            this.log.error(`[MiFanPlatform][DEBUG]DmakerFanP5c ====>err:` + err);
        });
    }

    getProperty(siid, piid) {
        return new Promise((resolve, reject) => {
            this.sendCommand(this.getMethod, siid, piid).then(result => {
                resolve(result[0]);
            }).catch(err=>{
                reject(err)
            })
        })
    }


    sendCommand(method, siid, piid, value) {
        return this.device.call(method, this.buildCommandArgs(siid, piid, value))
    }

    buildCommandArgs(siid, piid, value) {
        let args = {'siid': siid, 'piid': piid}
        if (this.deviceId) {
            args['did'] = this.deviceId;
        }
        if (value != null) {
            args['value'] = value;
        }
        return [args];
    }

    debounceWithIndividualTimeout(func, wait) {
        const timeoutsMap = new Map();

        function debounced(...args) {
            const key = args[0] + '-' + args[1] + '-' + args[1];

            const existingTimeoutId = timeoutsMap.get(key);
            if (existingTimeoutId) {
                this.log.debug('[MiFanPlatform][DEBUG]DmakerFanP5c  command canced!')
                clearTimeout(existingTimeoutId);
                timeoutsMap.delete(key);
            }

            // 执行
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    try {
                        func.apply(this, args).then(resolve).catch(reject);
                    } catch (err) {
                        reject(err)
                    } finally {
                        timeoutsMap.delete(key);
                    }
                }, wait);
                timeoutsMap.set(key, timeoutId);
            })
        }


        return debounced;
    }
}

module.exports = MiotDevice;
