import {MSNode, upsertSensor} from "../registration";
import {MSCommand} from "../types";

export const PRESENT_TYPE = {
    0:	"S_DOOR",
    1:	"S_MOTION",
    2:	"S_SMOKE",
    3:	"S_BINARY",
    4:	"S_DIMMER",
    5:	"S_COVER",
    6:	"S_TEMP",
    7:	"S_HUM",
    8:	"S_BARO",
    9:	"S_WIND",
    10:	"S_RAIN",
    11:	"S_UV",
    12:	"S_WEIGHT",
    13:	"S_POWER",
    14:	"S_HEATER",
    15:	"S_DISTANCE",
    16:	"S_LIGHT_LEVEL",
    17:	"S_ARDUINO_NODE",
    18:	"S_ARDUINO_REPEATER_NODE",
    19:	"S_LOCK",
    20:	"S_IR",
    21:	"S_WATER",
    22:	"S_AIR_QUALITY",
    23:	"S_CUSTOM",
    24:	"S_DUST",
    25:	"S_SCENE_CONTROLLER",
    26:	"S_RGB_LIGHT",
    27:	"S_RGBW_LIGHT",
    28:	"S_COLOR_SENSOR",
    29:	"S_HVAC",
    30:	"S_MULTIMETER",
    31:	"S_SPRINKLER",
    32:	"S_WATER_LEAK",
    33:	"S_SOUND",
    34:	"S_VIBRATION",
    35:	"S_MOISTURE",
    36:	"S_INFO",
    37:	"S_GAS",
    38:	"S_GPS",
    39:	"S_WATER_QUALITY"
} as {
    [key: number] : string
}

export async function handlePresentation(data: MSCommand, node: MSNode) {
    if (data.type === "S_ARDUINO_REPEATER_NODE") {
        node.repeater = true
    }
    if (data.type === "S_BINARY") {
        await upsertSensor(node, data.childSensorId, async sensor => {
            sensor.type = data.type
        })
    }
}
