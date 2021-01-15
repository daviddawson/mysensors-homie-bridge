import { EventEmitter } from "events";
import {MqttClient} from "mqtt"
import * as _ from "lodash"
import HomieNode from "./homieNode";
var homieVersion = '3.0.1';
var homieImplName = 'nodejs:homie-adapter';
var homieImplVersion = "";


const DEFAULT_CONFIG = {
    "name": "",
    "device_id": "unknown",
    "mqtt": {
        "host": "localhost",
        "port": 1883,
        "base_topic": "homie/",
        "auth": false,
        "username": null as any,
        "password": null as any,
    },
    "settings": {},
    "ip": null as any,
    "mac": null as any
}

/* Constructor
 *
 * Construct a new HomieDevice with a device_id or a config object containing some or all of:
 *
 * {
 *   "name": "Bare Minimum",
 *   "device_id": "bare-minimum",
 *   "mqtt": {
 *     "host": "localhost",
 *     "port": 1883,
 *     "base_topic": "devices/",
 *     "auth": false,
 *     "username": "user",
 *     "password": "pass"
 *   },
 *   "settings": {
 *     "percentage": 55 // device settings
 *   }
 * }
 *
 * Would like, but not implemented:
 *
 *   "wifi": {
 *     "ssid": "ssid",
 *     "password": "pass"
 *   },
 *   "ota": {
 *     "enabled": true
 *   }
 *
 */
export default class HomieDevice extends EventEmitter {

    config: any
    name: string
    mqttTopic: string
    startTime: number
    nodes: {
        [key: string]: HomieNode
    }
    firmwareName: string
    firmwareVersion: string
    statsInterval: number
    isConnected: boolean
    friendlyName: string
    interval: NodeJS.Timeout

    constructor(readonly mqttClient: MqttClient, config: any) {
        super()

        var t = this;
        if (_.isString(config)) {
            config = {name: config, device_id: config};
        }
        t.config = _.extend({}, DEFAULT_CONFIG, config);

        t.name = t.config.device_id;
        t.mqttTopic = t.config.mqtt.base_topic + t.config.device_id;
        t.startTime = Date.now();

        t.nodes = {};
        t.firmwareName = null;
        t.firmwareVersion = null;
        t.statsInterval = 60;
        t.isConnected = false;
        t.friendlyName = t.config.name;
    }

    setFirmware(firmwareName: any, firmwareVersion: any) {
        var t = this;
        t.firmwareName = firmwareName;
        t.firmwareVersion = firmwareVersion;
    }

    node(name: any, friendlyName: any, type: any, startRange?: any, endRange?: any) {
        var t = this;
        return t.nodes[name] = new HomieNode(t, name, friendlyName, type, startRange, endRange);
    }

    setup(quiet?: boolean) {
        var t = this;

        this.mqttClient.on('message', function (topic: string, message: Buffer) {
            if (message != null) {
                t.onMessage(topic, message.toString());
            } else {
                t.onMessage(topic, null);
            }

        })

        this.mqttClient.subscribe(t.mqttTopic + '/#');
        this.mqttClient.subscribe(t.config.mqtt.base_topic + '$broadcast/#');
    }

    end() {
        var t = this;
        t.mqttClient.publish(t.mqttTopic + '/$state', 'disconnected');
        t.mqttClient.end();
    }

    publishDevice() {
        var t = this;
        t.isConnected = true;

        // Advertise device properties
        t.mqttClient.publish(t.mqttTopic + '/$state', 'init', {retain: true});
        t.mqttClient.publish(t.mqttTopic + '/$homie', homieVersion, {retain: true});
        t.mqttClient.publish(t.mqttTopic + '/$implementation', homieImplName, {retain: true});
        t.mqttClient.publish(t.mqttTopic + '/$implementation/version', homieImplVersion, {retain: true});
        if (t.firmwareName) {
            t.mqttClient.publish(t.mqttTopic + '/$fw/name', t.firmwareName, {retain: true});
            t.mqttClient.publish(t.mqttTopic + '/$fw/version', t.firmwareVersion, {retain: true});
        }
        t.mqttClient.publish(t.mqttTopic + '/$name', t.config.name, {retain: true});
        t.mqttClient.publish(t.mqttTopic + '/$stats', 'interval,uptime', {retain: true});

        if (t.config.mac != null) {
            t.mqttClient.publish(t.mqttTopic + '/$mac', t.config.mac, {retain: true});
        }

        if (t.config.ip != null) {
            t.mqttClient.publish(t.mqttTopic + '/$localip', t.config.ip, {retain: true});
        }

        var nodes = [] as any[];
        _.each(t.nodes, function (node: any) {
            var node = node.isRange ? node.name + '[]' : node.name;

            nodes.push(node);
        })
        t.mqttClient.publish(t.mqttTopic + '/$nodes', nodes.join(','), {retain: true});

        _.each(t.nodes, function (node: any) {
            node.onConnect();
        })
        t.emit('connect');

        // Call the stats interval now, and at regular intervals
        t.onStatsInterval();
        t.interval = setInterval(function () {
            t.onStatsInterval();
        }, t.statsInterval * 1000);

        t.mqttClient.publish(t.mqttTopic + '/$state', 'ready', {retain: true});
    }

    onDisconnect() {
        var t = this;
        t.isConnected = false;
        clearInterval(t.interval);
        _.each(t.nodes, function (node: any) {
            node.onDisconnect();
        })
        t.interval = void
        t.emit('disconnect');
    }

    onStatsInterval() {
        var t = this;
        var uptime = (Date.now() - t.startTime) / 1000;
        t.mqttClient.publish(t.mqttTopic + '/$stats/uptime', '' + _.round(uptime, 0), {retain: false});
        t.mqttClient.publish(t.mqttTopic + '/$stats/interval', '' + t.statsInterval, {retain: true});
        _.each(t.nodes, function (node: any) {
            node.onStatsInterval();
        })
        t.emit('stats-interval');
    }

    onMessage(topic: string, msg: string) {
        if (!topic.startsWith("homie")) return

        var t = this;
        var parts = topic.split('/');
        var deviceTopic = parts.slice(2).join('/');

        // Emit broadcast messages to broadcast listeners
        if (parts[1] == '$broadcast') {
            t.emit('broadcast', deviceTopic, msg);
            return;
        }

        // Emit to listeners of all device topics
        t.emit('message', deviceTopic, msg);

        // Emit to listeners of the specific device topic
        t.emit('message:' + deviceTopic, msg);

        // Invoke property setters if this is a property set message
        if (parts[1] == t.name && parts[4] == 'set') {
            var nodeName = parts[2];
            var propName = parts[3];
            var value = msg;
            var range = {isRange: false, index: 0}

            if (nodeName.indexOf("_") > -1) {
                range.isRange = true;
                var nodeParts = nodeName.split('_');
                nodeName = nodeParts[0];
                range.index = parseInt(nodeParts[1])
            }
            var node = t.nodes[nodeName];

            if (node) {
                if (node.isRange !== range.isRange) {
                    return;
                }

                var prop = node.props[propName];
                if (prop && _.isFunction(prop.setter)) {
                    // This interface is consistent with esp8266 homie
                    prop.setter(range, value);
                }
            }
        }
    }
}
