const wifi = require("Wifi");
import CONFIG from './wifi.config.json'
const { name: WIFI_NAME, password: WIFI_PASSWORD } = CONFIG

function main() {
    console.log("Wifi status" + JSON.stringify(wifi.getStatus()));
    wifi.connect(WIFI_NAME, { password: WIFI_PASSWORD }, function (error) {
        if (error) console.error(error)
        else console.log(`Connected to: ${wifi.getIP().ip}`)
    })
};