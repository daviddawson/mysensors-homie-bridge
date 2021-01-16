import {registerNewNode} from "../commands";
import {getNodes, MSNode, upsert} from "../registration";
import {publishMSNodesToHomie} from "../homie";
import {client} from "../index";
import {MSCommand} from "../types";


export async function handleStream(data: MSCommand, node: MSNode) {
    console.log("STREAM command type not understood")
}
