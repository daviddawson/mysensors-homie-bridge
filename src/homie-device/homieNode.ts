import * as _ from "lodash"
import HomieDevice from "./homieDevice";
import { EventEmitter } from "events";
import HomieProperty from "./homieProperty";

export default class HomieNode extends EventEmitter {

    props: {
        [key: string]: HomieProperty
    }
    name: string
    type: string
    friendlyName: string
    homieDevice: HomieDevice
    mqttTopic: string
    isRange: boolean
    startRange: any
    endRange: any

    constructor(homieDevice: HomieDevice, name: string, friendlyName: string, type: string, startRange: any, endRange: any) {
        super()
        var t = this;
        t.props = {};
        t.name = name;
        t.type = type;
        t.friendlyName = friendlyName;
        t.homieDevice = homieDevice;
        t.mqttTopic = t.homieDevice.mqttTopic + '/' + t.name;
        t.isRange = false;
        if (startRange !== undefined && endRange !== undefined) {
            t.isRange = true;
            t.startRange = startRange;
            t.endRange = endRange;
        }
    }

    advertise(propName: string) {
        var t = this;
        return t.props[propName] = new HomieProperty(t, propName);
    }

    onConnect() {
        var t = this;
        var mqttClient = t.homieDevice.mqttClient;

        // Announce properties to MQTT
        mqttClient.publish(t.mqttTopic + '/$type', t.type, {retain: true});
        mqttClient.publish(t.mqttTopic + '/$name', t.friendlyName, {retain: true});

        const ads = [] as any[];
        _.each(t.props, function (prop) {
            ads.push(prop.name);
        })
        mqttClient.publish(t.mqttTopic + '/$properties', ads.join(','), {retain: true});

        if (t.isRange) {
            mqttClient.publish(t.mqttTopic + '/$array', t.startRange + '-' + t.endRange, {retain: true});
        }

        _.each(t.props, function (prop) {
            prop.onConnect();
        })

        t.emit('connect');
    }

    onDisconnect() {
        var t = this;
        t.emit('disconnect');
    }

    onStatsInterval() {
        var t = this;
        t.emit('stats-interval');
    }

// This name isn't very good (should be getProperty), but it matches the esp8266 homie implementation
    setProperty(propName: string) {
        return this.getProperty(propName)
    }

    getProperty(propName: string) {
        var t = this;
        return t.props[propName];
    }

}
