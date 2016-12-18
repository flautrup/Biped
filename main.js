// main.js
const wifi = require('Wifi')  // This is one of our magic, native Espruino friends.

// If you plan to publish your code,
// it's a good idea to keep your wifi name and password in a secure file that you do not version control.
// In this case I've named my file "wifi.config.json"
import CONFIG from './wifi.config.json'
const { name: WIFI_NAME, password: WIFI_PASSWORD } = CONFIG


// Wrap the call to wifi.connect in a native Promise so it's a bit easier to deal with later
const connect = (networkName, options) => {
  console.log(`attempting to connect to network named: ${ networkName }`)
  return new Promise((resolve, reject) => wifi.connect(networkName, options, error => {
      const ipAddress = wifi.getIP().ip
      if (error) reject(error)
      else resolve(ipAddress)
    })
  )
}

const lightOn = () =>{
digitalWrite(D2, isOn = false)
console.log('A blue LED should be on...')
}

const lightOff = () => {
digitalWrite(D2, isOn = true)
console.log(`The blue light should be off...`)
}

// Save a reference to the attempt that we can pass around.
const connectionAttempt = connect(WIFI_NAME, { password: WIFI_PASSWORD })
.then(ip => {
  console.log(`successfully connected to ${ ip }`)
  lightOn() // Again, this is just a reminder that we are wifi connected now
})
.then(() => {
  // From here on you have wifi access.
  // You can do all your app stuff in this or subsequent .then() blocks.
  // One good idea is to set up a "disconnected" event listener that allows you to handle
  // lost wifi
  wifi.on('disconnected', () => {
    lightOff()
    console.log(`successfully disconnected...`)
  })
})
// Here's an example of some app code that comes after we've set up all our wifi stuff.
// In this case I just trigger a disconnect for demonstration purposes.
// But you could have all your app's business logic playout here.
.then(() => setTimeout(wifi.disconnect, 3000) )
.catch(error => {
  console.error(error)
})

wifi.stopAP() // Don't act as a Wifi access point for other devices
