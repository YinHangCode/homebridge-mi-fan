# homebridge-mi-fan
[![npm version](https://badge.fury.io/js/homebridge-mi-fan.svg)](https://badge.fury.io/js/homebridge-mi-fan)

XiaoMi fan plugins for HomeBridge.   
   
Thanks for [nfarina](https://github.com/nfarina)(the author of [homebridge](https://github.com/nfarina/homebridge)), [OpenMiHome](https://github.com/OpenMiHome/mihome-binary-protocol), [aholstenson](https://github.com/aholstenson)(the author of [miio](https://github.com/aholstenson/miio)), 小马哥, all other developer and testers.   
   
**Note: If you find bugs, please submit them to [issues](https://github.com/YinHangCode/homebridge-mi-fan/issues) or [QQ Group: 107927710](//shang.qq.com/wpa/qunwpa?idkey=8b9566598f40dd68412065ada24184ef72c6bddaa11525ca26c4e1536a8f2a3d).**   

![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-fan/master/images/ZhiMiDCVariableFrequencyFan.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-fan/master/images/ZhiMiNaturalWindFan.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-fan/master/images/MiDCVariableFrequencyFan.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-fan/master/images/DmakerFan.jpg)

## Supported Devices
1.ZhiMiDCVariableFrequencyFan(智米直流变频落地扇 799RMB)   
2.ZhiMiNaturalWindFan(智米自然风风扇 599RMB)   
3.MiDCVariableFrequencyFan(米家直流变频落地扇 399RMB)       
4.DmakerFan(米家风扇1X 299RMB)

## Pre-Requirements
1.Make sure your IOS version is ios11 or later.   
## Installation
1. Install HomeBridge, please follow it's [README](https://github.com/nfarina/homebridge/blob/master/README.md).   
If you are using Raspberry Pi, please read [Running-HomeBridge-on-a-Raspberry-Pi](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi).   
2. Make sure you can see HomeBridge in your iOS devices, if not, please go back to step 1.   
3. Install packages.   
```
npm install -g homebridge-mi-fan
```
## Configuration
```
"platforms": [{
    "platform": "MiFanPlatform",
    "deviceCfgs": [{
        "type": "ZhiMiDCVariableFrequencyFan",
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
    }, {
        "type": "ZhiMiNaturalWindFan",
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
    }, {
        "type": "MiDCVariableFrequencyFan",
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
    }, {
        "type": "DmakerFan",
        "ip": "192.168.1.xxx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "fanName": "room fan",
        "fanDisable": false,
        "ledBulbName": "fan led switch",
        "ledBulbDisable": true
    }]
}]
```

## Get token
### Get token by miio2.db
setup MiJia(MiHome) app in your android device or android virtual machine.   
open MiJia(MiHome) app and login your account.   
refresh device list and make sure device display in the device list.   
get miio2.db(path: /data/data/com.xiaomi.smarthome/databases/miio2.db) file from your android device or android virtual machine.   
open website [[Get MiIo Tokens By DataBase File](http://miio2.yinhh.com/)], upload miio2.db file and submit.    
### Get token by network
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
### 0.1.1 (2019-06-03)
1.add support for DmakerFan
### 0.1.0 (2018-07-11)
1.add support for Mi DC VariableFrequency Fan.   
2.add support for ZhiMi NaturalWind Fan.   
### 0.0.5 (2018-02-10)
1.update 'package.json'.   
### 0.0.4 (2017-09-11)
1.optimized code.   
### 0.0.3 (2017-09-09)
1.optimized code.   
### 0.0.2 (2017-09-09)
1.fixed bug that led switch error.   
### 0.0.1 (2017-09-05)
1.support for ZhiMi DC VariableFrequency Fan.   
