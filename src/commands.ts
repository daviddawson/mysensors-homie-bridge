import {availableKeys, getNewId} from "./registration";


export async function sendCommand(cmd: any, client: any) {
    console.log("Sending data")
    console.log(cmd)
    await client.publish(`mysensors-in/${cmd.nodeId}/${cmd.childSensorId}/${cmd.command}/${cmd.ack}/${cmd.type}`, `${cmd.payload}`)
}

export async function registerNewNode(registrationRequest: any, client: any) {
    let newId = getNewId()
    console.log("New node is requesting ID, have allocated " + newId)
    console.log("There are now " + availableKeys() + " keys")
    return sendCommand({
        nodeId: registrationRequest.nodeId,
        childSensorId: registrationRequest.childSensorId,
        command: "3",
        ack: registrationRequest.ack,
        type: "4",
        payload: newId
    }, client)
}
