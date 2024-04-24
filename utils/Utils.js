

module.exports.buildCommandArgs =  function buildCommandArgs(deviceId, siid, piid, value) {
    let args = [{'did': deviceId, 'siid': siid, 'piid': piid}]
    if (value != null) {
        args[0]['value'] = value;
    }

    return args;
}
module.exports.isSuccess = function isSuccess(result) {
    return result[0].code === 0
}


