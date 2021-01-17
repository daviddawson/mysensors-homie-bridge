import {sendMySensorsCommand} from "../commands";
import {client} from "../index";
import HomieNode from "../homie-device/homieNode";
import {MSNode, Sensor} from "../registration";

/**
 * S_TEMP handler.
 */
export function setupSTemp(homieNode: HomieNode, node: MSNode, sensor: Sensor) {

    sensor.handler = async cmd => {
        console.log("[S_TEMP] sensor handler ")
        console.log(cmd)
        if (cmd.command === "SET") {
            if (cmd.type === "V_TEMP") {
                console.log("MS Node emits new sensors value")
                homieNode.setProperty(sensor.type + "_" + sensor.id).setRetained(true).send(cmd.payload);
            }
        }
    }

    homieNode
        .advertise(sensor.type + "_" + sensor.id)
        .setName('temperature')
        .setDatatype('float')
        .setFormat("-100:150")
        .setUnit("°C")
}
