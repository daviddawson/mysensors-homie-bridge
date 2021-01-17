import {MSNode, upsertSensor} from "../registration";
import {MSCommand, MSRawCommand} from "../types";

export type PresentationType = "S_DOOR" |
    "S_MOTION" |
    "S_SMOKE"|
    "S_BINARY"|
    "S_DIMMER"|
    "S_COVER"|
    "S_TEMP"|
    "S_HUM"|
    "S_BARO"|
    "S_WIND"|
    "S_RAIN"|
    "S_UV"|
    "S_WEIGHT"|
    "S_POWER"|
    "S_HEATER"|
    "S_DISTANCE"|
    "S_LIGHT_LEVEL"|
    "S_ARDUINO_NODE"|
    "S_ARDUINO_REPEATER_NODE"|
    "S_LOCK"|
    "S_IR"|
    "S_WATER"|
    "S_AIR_QUALITY"|
    "S_CUSTOM"|
    "S_DUST"|
    "S_SCENE_CONTROLLER"|
    "S_RGB_LIGHT"|
    "S_RGBW_LIGHT"|
    "S_COLOR_SENSOR"|
    "S_HVAC"|
    "S_MULTIMETER"|
    "S_SPRINKLER"|
    "S_WATER_LEAK"|
    "S_SOUND"|
    "S_VIBRATION"|
    "S_MOISTURE"|
    "S_INFO"|
    "S_GAS"|
    "S_GPS"|
    "S_WATER_QUALITY"

const PRESENT_TYPE = {
    "0":	"S_DOOR",
    "1":	"S_MOTION",
    "2":	"S_SMOKE",
    "3":	"S_BINARY",
    "4":	"S_DIMMER",
    "5":	"S_COVER",
    "6":	"S_TEMP",
    "7":	"S_HUM",
    "8":	"S_BARO",
    "9":	"S_WIND",
    "10":	"S_RAIN",
    "11":	"S_UV",
    "12":	"S_WEIGHT",
    "13":	"S_POWER",
    "14":	"S_HEATER",
    "15":	"S_DISTANCE",
    "16":	"S_LIGHT_LEVEL",
    "17":	"S_ARDUINO_NODE",
    "18":	"S_ARDUINO_REPEATER_NODE",
    "19":	"S_LOCK",
    "20":	"S_IR",
    "21":	"S_WATER",
    "22":	"S_AIR_QUALITY",
    "23":	"S_CUSTOM",
    "24":	"S_DUST",
    "25":	"S_SCENE_CONTROLLER",
    "26":	"S_RGB_LIGHT",
    "27":	"S_RGBW_LIGHT",
    "28":	"S_COLOR_SENSOR",
    "29":	"S_HVAC",
    "30":	"S_MULTIMETER",
    "31":	"S_SPRINKLER",
    "32":	"S_WATER_LEAK",
    "33":	"S_SOUND",
    "34":	"S_VIBRATION",
    "35":	"S_MOISTURE",
    "36":	"S_INFO",
    "37":	"S_GAS",
    "38":	"S_GPS",
    "39":	"S_WATER_QUALITY"
} as {
    [key: string] : PresentationType
}

export function decoratePresentType(ms: MSRawCommand) {
    if (ms.command === "PRESENT") {
        ms.type = PRESENT_TYPE[ms.typeRaw]
    }
}
export function decorateRawPresentType(ms: MSRawCommand) {
    if (ms.command === "PRESENT") {
        ms.typeRaw = Object.keys(PRESENT_TYPE).find(value => PRESENT_TYPE[value] === ms.type)
    }
}


export async function handlePresentation(data: MSCommand, node: MSNode) {
    switch(data.type) {
        case "S_ARDUINO_REPEATER_NODE":
            node.repeater = true
            break;
        case "S_CUSTOM":
        case "S_ARDUINO_NODE":
            console.log("Unhandled MySensor presentation " + data.type)
            break;
        default:
            await upsertSensor(node, data.childSensorId, async sensor => {
                sensor.type = data.type as PresentationType
            })
            break;
    }
}
