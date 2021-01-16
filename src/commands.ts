import {availableKeys, getNewId} from "./registration";
import {decorateRawCommandType, MSCommand, MSRawCommand} from "./types";
import {decorateRawInternalType} from "./ms-messaging/internal";
import {decorateRawPresentType} from "./ms-messaging/presentation";
import {decorateRawSetReqType} from "./ms-messaging/set_req";


export async function sendMySensorsCommand(cmd: MSCommand, client: any) {
    console.log("[mysensors] Sending data")
    console.log(cmd)

    let raw = {
        ...cmd
    } as MSRawCommand
    decorateRawCommandType(raw)
    decorateRawInternalType(raw)
    decorateRawPresentType(raw)
    decorateRawSetReqType(raw)

    await client.publish(`mysensors-in/${raw.nodeId}/${raw.childSensorId}/${raw.commandRaw}/${raw.ack}/${raw.typeRaw}`, `${raw.payload}`)
}

export async function registerNewNode(registrationRequest: any, client: any) {
    let newId = getNewId()
    console.log("New node is requesting ID, have allocated " + newId)
    console.log("There are now " + availableKeys() + " keys")
    return sendMySensorsCommand({
        nodeId: registrationRequest.nodeId,
        childSensorId: registrationRequest.childSensorId,
        command: "INTERNAL",
        ack: registrationRequest.ack,
        type: "I_ID_RESPONSE",
        payload: `${newId}`
    }, client)
}
