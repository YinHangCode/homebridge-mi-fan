module.exports.buildCommandArgs = function (deviceId, siid, piid, value) {
    let args = [{'did': deviceId, 'siid': siid, 'piid': piid}]
    if (value != null) {
        args[0]['value'] = value;
    }

    return args;
}
module.exports.isSuccess = function (result) {
    return result[0].code === 0
}

module.exports.createErrorPromise = function (msg) {
    return new Promise((resolve, reject) => {
        reject(new Error(msg));
    }).catch(err => console.log(err))
}

module.exports.debounceWithIndividualTimeout = function (func, wait) {
    // 用于存储每个参数组合对应的超时ID
    const timeoutsMap = new Map();

    function debounced(...args) {
        // 使用command 和piid, siid作为标识符(可以认定为同一操作,比如快速频繁设置风速)
        const key = args[0] + '-' + args[1];
        // 清除当前参数组合的timeout
        const existingTimeoutId = timeoutsMap.get(key);
        if (existingTimeoutId) {
            clearTimeout(existingTimeoutId);
            timeoutsMap.delete(key); // 执行后删除此参数组合的记录
        }
        // 执行
        const timeoutId = setTimeout(() => {
            try {
                func.apply(this, args);
            } catch (err) {
                timeoutsMap.delete(key); // 执行后删除此参数组合的记录
            }
        }, wait);
        timeoutsMap.set(key, timeoutId);
    }

    return debounced;
}




