import {sendMySensorsCommand} from "../commands";
import {client} from "../index";
import HomieNode from "../homie-device/homieNode";
import {MSNode, Sensor} from "../registration";

/**
 * S_HUM handler.
 */
export function setupSHum(homieNode: HomieNode, node: MSNode, sensor: Sensor) {

    sensor.handler = async cmd => {
        console.log("[S_HUM] sensor handler ")
        console.log(cmd)
        if (cmd.command === "SET") {
            console.log("MS Node emits new sensors value")
            homieNode.setProperty(sensor.type + "_" + sensor.id).setRetained(true).send(cmd.payload);
        }
    }

    homieNode
        .advertise(sensor.type + "_" + sensor.id)
        .setName('humidity')
        .setDatatype('float')
        .setFormat("0:100")
        .setUnit("%")
}
