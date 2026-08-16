/*
 * HEMS - Sensor de consumo (prototipo con potenciometro)
 * Placa: Arduino Uno WiFi Rev2  (arduino:megaavr:uno2018)
 *
 * Cableado:
 *   Potenciometro patita central (cursor) -> A0
 *   Potenciometro patita lateral          -> 5V
 *   Potenciometro otra patita lateral     -> GND
 *
 * El ADS1115 NO se usa. Un potenciometro es un divisor de tension que
 * entrega 0-5V DC; el ADC interno del ATmega4809 (10 bits, 0..1023) lo
 * lee directo. El ADS1115 existe para señales chicas o diferenciales
 * (ej. un transformador de corriente SCT-013), no para esto.
 *
 * ARQUITECTURA: leer y publicar son dos responsabilidades separadas.
 *   readSensor()  -> mide. No sabe como viaja el dato.
 *   publish()     -> transmite. No sabe como se midio.
 * Para migrar de Serial a WiFi se reescribe publish() y NADA mas.
 */

// ---------------------------------------------------------------- config

const uint8_t PIN_POT = A0;

// Debe coincidir con Device.nominalVoltage en la base (default 120).
const float NOMINAL_VOLTAGE_V = 120.0;

// Fondo de escala: potenciometro al maximo == esta corriente.
const float MAX_CURRENT_A = 15.0;

// Cadencia de muestreo. Este es el PRIMER eslabon de la latencia total que
// ve el usuario: muestreo -> POST del bridge -> poll del dashboard. Con
// 2000 ms este solo eslabon aportaba hasta 2 s de retardo al girar la
// perilla, asi que bajo a 1000 ms.
//
// Mas abajo no conviene: readPotAveraged() bloquea ~32 ms (OVERSAMPLES *
// delay(2)) y el promediado es lo que le saca el ruido al ADC. Bajar el
// intervalo sin bajar OVERSAMPLES solo agrega trafico, no precision.
const unsigned long SAMPLE_INTERVAL_MS = 1000;

// Promediado: el ADC tiene ruido de +-2 cuentas. Promediar N lecturas
// consecutivas lo aplana sin agregar hardware. Barato y efectivo.
const uint8_t OVERSAMPLES = 16;

const uint16_t ADC_MAX = 1023;  // ATmega4809: ADC de 10 bits

// ---------------------------------------------------------------- modelo

struct Reading {
  float amps;
  float volts;
  float watts;
  float kwhDelta;  // energia del intervalo, NO acumulada (ver IOT_API.md:112)
};

// ------------------------------------------------------- capa de lectura

uint16_t readPotAveraged() {
  uint32_t acc = 0;
  for (uint8_t i = 0; i < OVERSAMPLES; i++) {
    acc += analogRead(PIN_POT);
    delay(2);
  }
  return (uint16_t)(acc / OVERSAMPLES);
}

Reading readSensor(unsigned long elapsedMs) {
  Reading r;

  uint16_t raw = readPotAveraged();

  // Regla de tres sobre el fondo de escala. No uso map() porque map()
  // trabaja con enteros y nos comeria los decimales de la corriente.
  r.amps  = (raw / (float)ADC_MAX) * MAX_CURRENT_A;
  r.volts = NOMINAL_VOLTAGE_V;

  // Potencia APARENTE (S = V * I), no activa. Sin medir el desfase entre
  // tension y corriente no hay factor de potencia, y sin factor de
  // potencia no se puede afirmar que sean watts reales. El dashboard la
  // rotula "Potencia Aparente" justamente por esto.
  r.watts = r.volts * r.amps;

  // kWh del intervalo: W * h / 1000, con h = elapsedMs / 3600000
  r.kwhDelta = r.watts * (elapsedMs / 3600000.0) / 1000.0;

  return r;
}

// ---------------------------------------------- capa de transporte (hoy)

// Publica UNA linea JSON por lectura. El bridge en la PC la parsea y la
// convierte en el POST a /api/iot/data. Cualquier linea que no arranque
// con '{' es log humano y el bridge la ignora.
void publish(const Reading& r) {
  Serial.print(F("{\"a\":"));
  Serial.print(r.amps, 3);
  Serial.print(F(",\"v\":"));
  Serial.print(r.volts, 1);
  Serial.print(F(",\"w\":"));
  Serial.print(r.watts, 2);
  Serial.print(F(",\"kwh\":"));
  Serial.print(r.kwhDelta, 6);
  Serial.println(F("}"));
}

// ---------------------------------------------------------------- ciclo

unsigned long lastSample = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial) { ; }  // el Rev2 pasa por el mEDBG; esperamos el enlace

  pinMode(PIN_POT, INPUT);

  Serial.println(F("# HEMS pot sensor listo"));
  Serial.print(F("# fondo de escala: "));
  Serial.print(MAX_CURRENT_A, 1);
  Serial.print(F(" A @ "));
  Serial.print(NOMINAL_VOLTAGE_V, 0);
  Serial.println(F(" V"));

  lastSample = millis();
}

void loop() {
  unsigned long now = millis();

  // Resta de unsigned: sobrevive al desborde de millis() a los ~49 dias.
  if (now - lastSample < SAMPLE_INTERVAL_MS) return;

  unsigned long elapsed = now - lastSample;
  lastSample = now;

  publish(readSensor(elapsed));
}
