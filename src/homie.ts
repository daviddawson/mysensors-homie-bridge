import {MqttClient} from "mqtt"
import {MSNode} from "./registration";
import {sendMySensorsCommand} from "./commands";
import {client} from "./index";
import HomieDevice from "./homie-device/homieDevice";
import {setupSBinary} from "./type-handler/s_binary";
import {setupSTemp} from "./type-handler/s_temp";
import {setupSHum} from "./type-handler/s_hum";

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

    const myNode = myDevice.node("devices", 'MySensors Items', 'testnode');

    for (let sense of node.sensors) {
        switch (sense.type) {
            case "S_BINARY":
                setupSBinary(myNode, node, sense)
                break;
            case "S_TEMP":
                setupSTemp(myNode, node, sense)
                break;
            case "S_HUM":
                setupSHum(myNode, node, sense)
                break;
            default:
                console.log("Unsupported MySensors type will be ignored by Homie bridge: " + sense.type)
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
