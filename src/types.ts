

export const COMMAND = {
    0: "PRESENT",
    1: "SET",
    2: "REQ",
    3: "INTERNAL",
    4: "STREAM"
} as any

export interface MSCommand {
    commandRaw: string;
    payload: string;
    ack: any;
    typeRaw: string;
    type: string;
    nodeId: string;
    childSensorId: string;
    command: string
}
