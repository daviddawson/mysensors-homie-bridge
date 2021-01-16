import {registerNewNode} from "../commands";
import {getNodes, upsert} from "../registration";
import {publishMSNodesToHomie} from "../homie";
import {client} from "../index";
import {MSCommand, MSRawCommand} from "../types";

export type InternalType =  "I_BATTERY_LEVEL"|
    "I_TIME"|
    "I_VERSION"|
    "I_ID_REQUEST"|
    "I_ID_RESPONSE"|
    "I_INCLUSION_MODE"|
    "I_CONFIG"|
    "I_FIND_PARENT"|
    "I_FIND_PARENT_RESPONSE"|
    "I_LOG_MESSAGE"|
    "I_CHILDREN"|
    "I_SKETCH_NAME"|
    "I_SKETCH_VERSION"|
    "I_REBOOT"|
    "I_GATEWAY_READY"|
    "I_SIGNING_PRESENTATION"|
    "I_NONCE_REQUEST"|
    "I_NONCE_RESPONSE"|
    "I_HEARTBEAT_REQUEST"|
    "I_PRESENTATION"|
    "I_DISCOVER_REQUEST"|
    "I_DISCOVER_RESPONSE"|
    "I_HEARTBEAT_RESPONSE"|
    "I_LOCKED"|
    "I_PING"|
    "I_PONG"|
    "I_REGISTRATION_REQUEST"|
    "I_REGISTRATION_RESPONSE"|
    "I_DEBUG"|
    "I_SIGNAL_REPORT_REQUEST"|
    "I_SIGNAL_REPORT_REVERSE"|
    "I_SIGNAL_REPORT_RESPONSE"|
    "I_PRE_SLEEP_NOTIFICATION"|
    "I_POST_SLEEP_NOTIFICATION"

const INTERNAL_TYPE = {
    0:	"I_BATTERY_LEVEL",
    1:	"I_TIME",
    2:	"I_VERSION",
    3:	"I_ID_REQUEST",
    4:	"I_ID_RESPONSE",
    5:	"I_INCLUSION_MODE",
    6:	"I_CONFIG",
    7:	"I_FIND_PARENT",
    8:	"I_FIND_PARENT_RESPONSE",
    9:	"I_LOG_MESSAGE",
    10:	"I_CHILDREN",
    11:	"I_SKETCH_NAME",
    12:	"I_SKETCH_VERSION",
    13:	"I_REBOOT",
    14:	"I_GATEWAY_READY",
    15:	"I_SIGNING_PRESENTATION",
    16:	"I_NONCE_REQUEST",
    17:	"I_NONCE_RESPONSE",
    18:	"I_HEARTBEAT_REQUEST",
    19:	"I_PRESENTATION",
    20:	"I_DISCOVER_REQUEST",
    21:	"I_DISCOVER_RESPONSE",
    22:	"I_HEARTBEAT_RESPONSE",
    23:	"I_LOCKED",
    24:	"I_PING",
    25:	"I_PONG",
    26:	"I_REGISTRATION_REQUEST",
    27:	"I_REGISTRATION_RESPONSE",
    28:	"I_DEBUG",
    29:	"I_SIGNAL_REPORT_REQUEST",
    30:	"I_SIGNAL_REPORT_REVERSE",
    31:	"I_SIGNAL_REPORT_RESPONSE",
    32:	"I_PRE_SLEEP_NOTIFICATION",
    33:	"I_POST_SLEEP_NOTIFICATION"
} as {
    [key: string] : InternalType
}

export function decorateInternalType(ms: MSRawCommand) {
    if (ms.command === "INTERNAL") {
        ms.type = INTERNAL_TYPE[ms.typeRaw]
    }
}

export function decorateRawInternalType(ms: MSRawCommand) {
    if (ms.command === "INTERNAL") {
        ms.typeRaw = Object.keys(INTERNAL_TYPE).find(value => INTERNAL_TYPE[value] === ms.type)
    }
}


export async function handleInternal(data: MSCommand) {
    switch (data.type) {
        case "I_ID_REQUEST":
            await registerNewNode(data, client)
            await publishMSNodesToHomie(client, getNodes())
            break;
        case "I_SKETCH_NAME":
            await upsert(data.nodeId, async node => {
                node.name = data.payload
            })
            await publishMSNodesToHomie(client, getNodes())
    }
}
