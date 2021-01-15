import * as _ from "lodash"
import HomieNode from "./homieNode";

export default class HomieProperty {

    name: string
    friendlyName: string
    isSubscribedToSet: boolean
    retained: boolean
    homieNode: HomieNode
    mqttTopicProperty: string

    format: any
    setter: any
    datatype: any
    unit: any
    rangeIndex: any

    constructor(homieNode: HomieNode, name: string) {
        var t = this;
        t.name = name;
        t.friendlyName = null;
        t.setter = null;
        t.isSubscribedToSet = false;
        t.retained = true;
        t.homieNode = homieNode;
        t.mqttTopicProperty = t.homieNode.mqttTopic + '/' + t.name;
        t.format = null;
        t.datatype = null;
        t.unit = null;
        t.rangeIndex = null;
    }

    onConnect() {
        var t = this;
        var mqttClient = t.homieNode.homieDevice.mqttClient;

        mqttClient.publish(t.mqttTopicProperty + '/$name', t.friendlyName, {retain: true});
        mqttClient.publish(t.mqttTopicProperty + '/$retained', t.retained ? 'true' : 'false', {retain: true});
        mqttClient.publish(t.mqttTopicProperty + '/$settable', t.setter ? 'true' : 'false', {retain: true});

        if (t.unit !== null) {
            mqttClient.publish(t.mqttTopicProperty + '/$unit', t.unit, {retain: true});
        }

        if (t.datatype !== null) {
            mqttClient.publish(t.mqttTopicProperty + '/$datatype', t.datatype, {retain: true});
        }

        if (t.format !== null) {
            mqttClient.publish(t.mqttTopicProperty + '/$format', t.format, {retain: true});
        }
    }

    setName(friendlyName: string) {
        var t = this;
        t.friendlyName = friendlyName;
        return t;
    }

    setUnit(unit: string) {
        var t = this;
        t.unit = unit;
        return t;
    }

    setDatatype(datatype: string) {
        var t = this;
        t.datatype = datatype;
        return t;
    }

    setFormat(format: string) {
        var t = this;
        t.format = format;
        return t;
    }

    settable(setter: any) {
        var t = this;
        t.setter = setter;
        return t;
    }

    setRetained(val: boolean) {
        var t = this;
        t.retained = val;
        return t;
    }

    setRange(rangeIndex: any) {
        var t = this;
        t.rangeIndex = rangeIndex;
        return t;
    }

    send(val: any) {
        var t = this;
        var mqttClient = t.homieNode.homieDevice.mqttClient;
        var topic = t.mqttTopicProperty;

        if (t.homieNode.isRange && t.rangeIndex !== null) {
            topic = t.homieNode.mqttTopic + '_' + t.rangeIndex + '/' + t.name;
        }

        mqttClient.publish(topic, val, {retain: t.retained});
        t.retained = false;
        t.rangeIndex = null;
        return t;
    }
}
