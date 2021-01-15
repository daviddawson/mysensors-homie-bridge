import {MSCommand} from "../types";
import {MSNode} from "../registration";
import {getHomie} from "../homie";


export const SET_REQ_TYPE = {
    0:	"V_TEMP",
    1:	"V_HUM",
    2:	"V_STATUS",
    3:	"V_PERCENTAGE",
    4:	"V_PRESSURE",
    5:	"V_FORECAST",
    6:	"V_RAIN",
    7:	"V_RAINRATE",
    8:	"V_WIND",
    9:	"V_GUST",
    10:	"V_DIRECTION",
    11:	"V_UV",
    12:	"V_WEIGHT",
    13:	"V_DISTANCE",
    14:	"V_IMPEDANCE",
    15:	"V_ARMED",
    16:	"V_TRIPPED",
    17:	"V_WATT",
    18:	"V_KWH",
    19:	"V_SCENE_ON",
    20:	"V_SCENE_OFF",
    21:	"V_HVAC_FLOW_STATE",
    22:	"V_HVAC_SPEED",
    23:	"V_LIGHT_LEVEL",
    24:	"V_VAR1",
    25:	"V_VAR2",
    26:	"V_VAR3",
    27:	"V_VAR4",
    28:	"V_VAR5",
    29:	"V_UP",
    30:	"V_DOWN",
    31:	"V_STOP",
    32:	"V_IR_SEND",
    33:	"V_IR_RECEIVE",
    34:	"V_FLOW",
    35:	"V_VOLUME",
    36:	"V_LOCK_STATUS",
    37:	"V_LEVEL",
    38:	"V_VOLTAGE",
    39:	"V_CURRENT",
    40:	"V_RGB",
    41:	"V_RGBW",
    42:	"V_ID",
    43:	"V_UNIT_PREFIX",
    44:	"V_HVAC_SETPOINT_COOL",
    45:	"V_HVAC_SETPOINT_HEAT",
    46:	"V_HVAC_FLOW_MODE",
    47:	"V_TEXT",
    48:	"V_CUSTOM",
    49:	"V_POSITION",
    50:	"V_IR_RECORD",
    51:	"V_PH",
    52:	"V_ORP",
    53:	"V_EC",
    54:	"V_VAR",
    55:	"V_VA",
    56:	"V_POWER_FACTOR"
} as {
    [key: number] : string
}

export async function handleSet(data: MSCommand, node: MSNode) {
    const homie = getHomie(data.nodeId)

    homie.nodes
}

export async function handleReq(data: MSCommand, node: MSNode) {
    console.log("REQ command type not understood")
}
