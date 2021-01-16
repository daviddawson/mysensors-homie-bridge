

// Enable and select radio type attached
#define MY_RF24_CE_PIN 10
#define MY_RF24_CS_PIN 9

/*
 * Documentation: https://www.mysensors.org
 * Support Forum: https://forum.mysensors.org
 *
 * https://www.mysensors.org/build/relay
 */

#define MY_DEBUG
#define MY_RADIO_NRF24
#define MY_REPEATER_FEATURE
#include <SPI.h>
#include <MySensors.h>
#include <Bounce2.h>

#define RELAY_PIN  3
//#define BUTTON_PIN  3
#define CHILD_ID 1
#define RELAY_ON 1
#define RELAY_OFF 0

Bounce debouncer = Bounce();
bool state = false;
bool initialValueSent = false;

MyMessage msg(CHILD_ID, V_STATUS);

void setup()
{
//  pinMode(BUTTON_PIN, INPUT_PULLUP);
//  debouncer.attach(BUTTON_PIN);
//  debouncer.interval(10);

  // Make sure relays are off when starting up

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);
}

void presentation()  {
  sendSketchInfo("TestDevice", "1.0");
  present(CHILD_ID, S_BINARY);
}

void loop()
{
  if (!initialValueSent) {
    initialValueSent = true;
    Serial.println("Sending initial value");
    send(msg.set(RELAY_OFF));
    Serial.println("Requesting initial value from controller");
    request(CHILD_ID, V_STATUS);
    wait(2000, C_SET, V_STATUS);
  }
//  if (debouncer.update()) {
//    if (debouncer.read()==LOW) {
//      state = !state;
//      // Send new state and request ack back
//      send(msg.set(state?RELAY_ON:RELAY_OFF), true);
//    }
//  }
}

void receive(const MyMessage &message) {
  if (message.isAck()) {
     Serial.println("This is an ack from gateway");
  }

  if (message.type == V_STATUS) {
    if (!initialValueSent) {
      Serial.println("Receiving initial value from controller");
      initialValueSent = true;
    }
    // Change relay state
    state = (bool)message.getInt();

    Serial.println("Setting value value from controller " + state);
    Serial.println(state);

    if (state == 1) {
      Serial.println("Switching ON relay");
       digitalWrite(RELAY_PIN, LOW);
       send(msg.set(RELAY_ON));
    } else {
      Serial.println("Switching OFF relay");
      digitalWrite(RELAY_PIN, HIGH);
      send(msg.set(RELAY_OFF));
    }
  }
}
