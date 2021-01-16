import {PresentationType} from "./ms-messaging/presentation";
import {InternalType} from "./ms-messaging/internal";
import {SetReqType} from "./ms-messaging/set_req";

export type CommandType = "PRESENT"|
    "SET"|
    "REQ"|
    "INTERNAL"|
    "STREAM"

const COMMAND = {
    "0": "PRESENT",
    "1": "SET",
    "2": "REQ",
    "3": "INTERNAL",
    "4": "STREAM"
} as {
    [key: string]: CommandType
}

export function decorateCommandType(ms: MSRawCommand) {
    ms.command = COMMAND[ms.commandRaw]
}

export function decorateRawCommandType(ms: MSRawCommand) {
    ms.commandRaw = Object.keys(COMMAND).find(value => COMMAND[value] === ms.command)
}

export interface MSCommand {
    payload: string;
    ack: any;
    type: PresentationType | InternalType | SetReqType;
    nodeId: string;
    childSensorId: string;
    command: CommandType
}

export interface MSRawCommand {
    commandRaw: string;
    payload: string;
    ack: any;
    typeRaw: string;
    type: PresentationType | InternalType | SetReqType;
    nodeId: string;
    childSensorId: string;
    command: CommandType
}
