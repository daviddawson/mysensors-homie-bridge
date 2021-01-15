
import { connect } from "mqtt"
import {registerNewNode} from "./commands";
import {COMMAND, MSCommand} from "./types";
import {getNodes, loadMsNodes, upsert, upsertSensor} from "./registration";
import {publishMSNodesToHomie} from "./homie";
import {handlePresentation, PRESENT_TYPE} from "./ms_messaging/presentation";
import {handleInternal, INTERNAL_TYPE} from "./ms_messaging/internal";
import {handleReq, handleSet, SET_REQ_TYPE} from "./ms_messaging/set_req";
import {handleStream} from "./ms_messaging/stream";

export const client  = connect('mqtt://192.168.68.133')

loadMsNodes()

client.on('connect', function () {
    client.subscribe('mysensors-out/#', function (err) {
        console.log("Connected")
        publishMSNodesToHomie(client, getNodes())
    })
})

function getType(command: any, type: any) {
    switch(command) {
        case "PRESENT":
            return PRESENT_TYPE[type]
        case "SET":
        case "REQ":
            return SET_REQ_TYPE[type]
        case "INTERNAL":
            return INTERNAL_TYPE[type]
        default:
            return type
    }
}



client.on('message', function (topic, message) {

    let parts = topic.split("/") as any

    if (parts[0] === "mysensors-out") {
        // message is Buffer
        console.log(`${topic} :: ${message.toString()}`)

        let data: MSCommand = {
            nodeId: parts[1],
            childSensorId: parts[2],
            command: COMMAND[parts[3]],
            commandRaw: parts[3],
            ack: parts[4],
            type: getType(COMMAND[parts[3]], parts[5]),
            typeRaw: parts[5],
            payload: message.toString()
        }

        console.log(data)
        switch(data.command) {
            case "INTERNAL":
                handleInternal(data)
                break;
            case "PRESENT":
                upsert(data.nodeId, async node => {
                    await handlePresentation(data, node);
                }).then(value => {
                    publishMSNodesToHomie(client, getNodes())
                })
                break;
            case "SET":
                upsert(data.nodeId, node => handleSet(data, node))
                break
            case "REQ":
                upsert(data.nodeId, node => handleReq(data, node))
            case "STREAM":
                upsert(data.nodeId, node => handleStream(data, node))
                break;
            default:
                console.log("UNKNOWN Command Type " + JSON.stringify(data))
        }
    }

})
