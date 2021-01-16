import * as fs from "fs"
import {PresentationType} from "./ms-messaging/presentation";
import {MSCommand} from "./types";

export interface Sensor {
    id: string
    type: PresentationType
    handler?: (cmd: MSCommand) => Promise<void>
}

export interface MSNode {
    nodeId: string
    repeater: boolean
    name: string

    sensors: Sensor[]
}

let devices = [] as MSNode[]

const deviceIds = {} as any

export function availableKeys() {
    return 256 - Object.keys(deviceIds).length
}

export function getNewId() {
    for (let i = 1; i < 256; i++ ) {
        if (!deviceIds.hasOwnProperty(`${i}`)) {
            console.log("  consuming ID to hand out" + i)
            deviceIds[`${i}`] = `${i}`
            return i
        }
    }
}

function persist() {
    fs.writeFileSync("mysensor-homie.json", JSON.stringify(devices, null, 2))
}

export function loadMsNodes() {
    if (fs.existsSync("mysensor-homie.json")) {
        devices = JSON.parse(fs.readFileSync("mysensor-homie.json").toString())
        devices.forEach(value => deviceIds[value.nodeId] = value.nodeId)
    }
}

export async function upsertSensor(node: MSNode, sensorId: string, exec: (sensor: Sensor) => Promise<void>) {
    let existingSensor = node.sensors.find(value => value.id === sensorId)
    if (!existingSensor) {
        existingSensor = {
            id: sensorId, type: null
        }
        node.sensors.push(existingSensor)
    }

    await exec(existingSensor)
    persist()
}

export async function upsert(nodeId: string, exec: (node: MSNode) => Promise<void>) {

    let existingNode = devices.find(value => value.nodeId === nodeId)

    if (!existingNode) {
        existingNode = {
            nodeId, repeater: false, name: "Unknown New Node", sensors: []
        }
        devices.push(existingNode)
    }

    await exec(existingNode)

    persist()
}

export function getNodes(): MSNode[] {
    return devices
}
