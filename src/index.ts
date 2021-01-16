
import * as fs from "fs"
import { connect } from "mqtt"
import {registerNewNode} from "./commands";
import {decorateCommandType, MSCommand, MSRawCommand} from "./types";
import {getNodes, loadMsNodes, upsert, upsertSensor} from "./registration";
import {publishMSNodesToHomie} from "./homie";
import {decoratePresentType, handlePresentation} from "./ms-messaging/presentation";
import {decorateInternalType, handleInternal} from "./ms-messaging/internal";
import {decorateSetReqType, handleReq, handleSet} from "./ms-messaging/set_req";
import {handleStream} from "./ms-messaging/stream";

let config = JSON.parse(fs.readFileSync("config.json").toString())

export const client  = connect(config.brokerUrl)

loadMsNodes()

client.on('connect', function () {
    client.subscribe('mysensors-out/#', function (err) {
        console.log("Connected")
        publishMSNodesToHomie(client, getNodes())
    })
})

client.on('message', function (topic, message) {

    let parts = topic.split("/") as any

    if (parts[0] === "mysensors-out") {
        console.log(`[mysensors] ${topic} :: ${message.toString()}`)

        let data: MSRawCommand = {
            nodeId: parts[1],
            childSensorId: parts[2],
            command: null,
            commandRaw: parts[3],
            ack: parts[4],
            type: null,
            typeRaw: parts[5],
            payload: message.toString()
        }
        decorateCommandType(data)
        decoratePresentType(data)
        decorateInternalType(data)
        decorateSetReqType(data)

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
