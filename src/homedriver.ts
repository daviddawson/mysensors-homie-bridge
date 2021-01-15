
import HomieDevice from "./homie-device/homieDevice"
import { MqttClient, connect } from "mqtt"

async function setup() {

    const mqtt: MqttClient = connect('mqtt://192.168.68.133')

    const device = new HomieDevice(mqtt, {
        "name": "MySensor: FAKE NODE",
        "device_id": "ms_fake_node_testing",
        "settings": {
            "percentage": 55
        }
    })
    const myNode = device.node("devices", 'MY Sensors Items', 'testnode');
    console.log("BOOBOO")

    device.setup();
    device.publishDevice()

    await pause(30000)

    device.friendlyName = "WOOTWOOT"

    myNode.advertise("totes-property").setName('on/off').setDatatype('boolean').settable((range: any, value: any) => {
        console.log("GOT A PING")
        console.log({
            value, range
        })
    })

    device.publishDevice()
}

async function pause(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

setup()
