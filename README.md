# homebridge-mi-fan
[![npm version](https://badge.fury.io/js/homebridge-mi-fan.svg)](https://badge.fury.io/js/homebridge-mi-fan)

XiaoMi fan plugins for HomeBridge.   
Thanks for [nfarina](https://github.com/nfarina)(the author of [homebridge](https://github.com/nfarina/homebridge)), [OpenMiHome](https://github.com/OpenMiHome/mihome-binary-protocol), [aholstenson](https://github.com/aholstenson)(the author of [miio](https://github.com/aholstenson/miio)), all other developer and testers.   

**Note: If you find bugs, please submit them to [issues](https://github.com/YinHangCode/homebridge-mi-fan/issues) or [QQ Group: 107927710](//shang.qq.com/wpa/qunwpa?idkey=8b9566598f40dd68412065ada24184ef72c6bddaa11525ca26c4e1536a8f2a3d).**   

![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-fan/master/images/Fan.jpg)

## Installation
1. Install HomeBridge, please follow it's [README](https://github.com/nfarina/homebridge/blob/master/README.md).   
If you are using Raspberry Pi, please read [Running-HomeBridge-on-a-Raspberry-Pi](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi).   
2. Make sure you can see HomeBridge in your iOS devices, if not, please go back to step 1.   
3. Install packages.   
```
npm install -g miio homebridge-mi-fan
```
## Configuration
```
"platforms": [{
    "platform": "MiFanPlatform",
    "deviceCfgs": [{
        "ip": "192.168.1.xxx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "fanName": "room fan",
        "fanDisable": false,
        "temperatureName": "room temperature",
        "temperatureDisable": false,
        "humidityName": "room humidity",
        "humidityDisable": false,
        "buzzerSwitchName": "fan buzzer switch",
        "buzzerSwitchDisable": true,
        "ledBulbName": "fan led switch",
        "ledBulbDisable": true
    }]
}]
```
## Get token
Open command prompt or terminal. Run following command:   
```
miio --discover
```
Wait until you get output similar to this:   
```
Device ID: xxxxxxxx   
Model info: Unknown   
Address: 192.168.88.xx   
Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx via auto-token   
Support: Unknown   
```
"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" is token.   
If token is "???", then reset device and connect device created Wi-Fi hotspot.   
Run following command:   
```
miio --discover --sync
```
Wait until you get output.   
For more information about token, please refer to [OpenMiHome](https://github.com/OpenMiHome/mihome-binary-protocol) and [miio](https://github.com/aholstenson/miio).   
## Version Logs
### 0.0.1
1.support for XiaoMi Fan.   
