import {sendMySensorsCommand} from "../commands";
import {client} from "../index";
import HomieNode from "../homie-device/homieNode";
import {MSNode, Sensor} from "../registration";

/**
 * S_BINARY handler.
 *
 * Exposes the MySensor type in homie and manages bidirectional data.
 *
 * Data from the homie network is setup via the `settable` function.
 *
 * Data from the mysensors network is sent via a handler registered on the sensor by this function
 */
export function setupSBinary(homieNode: HomieNode, node: MSNode, sensor: Sensor) {

    sensor.handler = async cmd => {
        console.log("[S_BINARY] sensor handler ")
        console.log(cmd)
        homieNode.setProperty(sensor.type + "_" + sensor.id).setRetained(true).send(cmd.payload == "1" ? "true" : "false");
    }

    homieNode.advertise(sensor.type + "_" + sensor.id).setName('on/off').setDatatype('boolean').settable(function (range: any, value: any) {
        console.log(`[homie] NODE ${node.nodeId}: Switching ${sensor.id} on/ off ` + value)

        return sendMySensorsCommand({
            nodeId: node.nodeId,
            childSensorId: sensor.id,
            command: "SET",
            ack: "0",
            type: "V_STATUS", // V_STATUS
            payload: value == "true" ? "1" : "0"
        }, client)
    });
}
