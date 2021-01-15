import { MqttClient } from "mqtt"
import {MSNode} from "./registration";
import {sendCommand} from "./commands";
import {client} from "./index";
import HomieDevice from "./homie-device/homieDevice";

interface HomieReg {
    msId: string
    device: HomieDevice
}

let homies = [] as HomieReg[]

export async function publishMSNodesToHomie(mqtt: MqttClient, nodes: MSNode[]) {
    console.log("Creating Homie Devices")

    for (let node of nodes) {
        console.log(`Publish MSNode ${node.nodeId}`)
        let existingHomie = homies.find(value => value.msId === node.nodeId)

        if (!existingHomie) {
            console.log(`  no Homie device active, creating for ${node.nodeId}`)
            existingHomie = createHomie(mqtt, node)
            homies.push(existingHomie)
        } else {
            console.log(`   Home Device active for ${node.nodeId}`)
        }
        existingHomie.device.publishDevice()
    }
}

function createHomie(mqtt: MqttClient, node: MSNode): HomieReg {

    var config = {
        "name": "MySensor: " + node.name,
        "device_id": "ms_" + node.nodeId,
        "settings": {
            "percentage": 55
        }
    }

    var myDevice = new HomieDevice(mqtt, config);

    const myNode = myDevice.node("devices", 'MY Sensors Items', 'testnode');

    for (let sense of node.sensors) {
        if (sense.type === "S_BINARY") {
            myNode.advertise(sense.type + "_" + sense.id).setName('on/off').setDatatype('boolean').settable(function (range: any, value: any) {
                console.log(`NODE ${node.nodeId}: Switching ${sense.id} on/ off ` + value)
                myNode.setProperty(sense.type + "_" + sense.id).setRetained(true).send(value);

                return sendCommand({
                    nodeId: node.nodeId,
                    childSensorId: sense.id,
                    command: "1",
                    ack: "0",
                    type: "2", // V_STATUS
                    payload: value == "true" ? "1" : "0"
                }, client)
            });
        } else {
            console.log("Unsupported MYSensors type will be ignored by Homie bridge: " + sense.type)
        }
    }

    myDevice.setup();

    return {
        msId: node.nodeId,
        device: myDevice
    }
}

export function getHomie(nodeId: string): HomieDevice {
    let ret = homies.find(value => value.msId === nodeId)

    if (ret) return ret.device

    return null
}
