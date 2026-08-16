# Prototipo fisico -> Dashboard HEMS

Cadena completa desde el potenciometro hasta las tarjetas de "Lecturas en Vivo".

## Hardware

| Componente | Detalle |
| --- | --- |
| Placa | Arduino Uno WiFi Rev2 (`arduino:megaavr:uno2018`, VID `0x03EB` / PID `0x2145`) |
| Sensor | Potenciometro (simula la corriente de una carga) |
| ADS1115 | **No se usa.** Ver "Por que no el ADS1115" mas abajo |

### Cableado

```
Potenciometro, patita CENTRAL (cursor)  ->  A0
Potenciometro, una patita lateral       ->  5V
Potenciometro, la otra patita lateral   ->  GND
```

Cual lateral va a 5V y cual a GND es indistinto: solo invierte el sentido
del giro. La central es la unica que no se negocia.

### Por que no el ADS1115

El ADS1115 es un ADC externo de 16 bits por I2C. Su razon de existir son las
señales chicas o diferenciales — el milivoltaje que entrega un transformador
de corriente tipo SCT-013, donde los 10 bits del ADC interno no alcanzan.

Un potenciometro es un divisor de tension: entrega 0-5V DC francos, que el
ADC interno del ATmega4809 lee directo. Interponer el ADS1115 agrega un bus
I2C, una libreria y dos modos de falla nuevos sin ganar precision util.

Cuando el prototipo pase a un sensor de corriente real, el ADS1115 vuelve —
y ese es el momento de reconectarlo.

## Puesta en marcha

Requiere Docker y Node 22+.

```bash
# 1. Infraestructura (Postgres + InfluxDB)
docker compose up -d db influxdb

# 2. Dependencias, esquema y usuario admin
npm install
npx prisma db push
npm run seed                 # admin@example.com / admin

# 3. Crear el Device y dejar su token en .env
npm run provision

# 4. Compilar y subir el firmware
#    (arduino-cli con el core arduino:megaavr instalado)
arduino-cli compile -b arduino:megaavr:uno2018 firmware/hems_pot_sensor
arduino-cli upload  -b arduino:megaavr:uno2018 -p COM3 firmware/hems_pot_sensor

# 5. Levantar la app y el puente (dos terminales)
npm run dev
npm run bridge
```

Entrar a `http://localhost:3000`, loguearse como admin y abrir el detalle del
dispositivo. Las tarjetas se refrescan cada 10 s (`LiveReadingsPanel.jsx`).

### Variables de entorno

| Variable | Default | Para que |
| --- | --- | --- |
| `HEMS_DEVICE_TOKEN` | — | `apiToken` del Device. Lo escribe `npm run provision` |
| `HEMS_SERIAL_PORT` | `COM3` | Puerto de la placa (`arduino-cli board list`) |
| `HEMS_API_BASE` | `http://localhost:3000` | Base de la API |
| `HEMS_POST_MS` | `5000` | Cadencia de POST. Minimo 5000 segun `docs/IOT_API.md` |

El token sale del entorno; nunca va hardcodeado en el firmware ni en el puente.

## Arquitectura

```
  Potenciometro          Arduino Uno WiFi Rev2              PC
  ┌───────────┐          ┌──────────────────────┐     ┌──────────────────┐
  │  0 - 5V   │─── A0 ──▶│ readSensor()         │     │ serial_bridge.js │
  └───────────┘          │   promedia 16 muestras│    │   acumula kWh    │
                         │   A, V, W, kWh delta  │    │   agrupa y postea│
                         │ publish()             │    └────────┬─────────┘
                         │   1 linea JSON        │──USB────────┘
                         └──────────────────────┘              │
                                                              ▼
                                              POST /api/iot/data (Bearer token)
                                                              │
                                                   InfluxDB ◀──┘
                                                              │
                                        GET /api/devices/:id/latest ──▶ Dashboard
```

El firmware separa **medir** de **transmitir** a proposito:

- `readSensor()` mide y no sabe como viaja el dato.
- `publish()` transmite y no sabe como se midio.

Migrar a WiFi es reescribir `publish()` con WiFiNINA. `readSensor()` no se
toca. Esa es toda la ventaja de haber separado las dos responsabilidades.

## Decisiones que conviene poder defender

**Serial antes que WiFi.** Con serial, un numero equivocado tiene un solo
sospechoso: la medicion. Con WiFi hay cuatro (medicion, red, token,
firewall). Se depura la medicion primero, y despues se agrega la red.

**Potencia aparente, no activa.** `W = V * I` es potencia *aparente*. Sin
medir el desfase entre tension y corriente no hay factor de potencia, y sin
factor de potencia no se puede afirmar que sean watts reales. El dashboard
rotula la tarjeta "Potencia Aparente" por esa razon.

**La tension es nominal, no medida.** Sale de `Device.nominalVoltage` (120 V
por defecto) replicado en el firmware. No hay sensor de tension en el
prototipo: es una constante declarada, no una medicion.

**Los kWh son un delta.** Cada POST manda la energia *del intervalo*, no un
acumulado (`docs/IOT_API.md:112`). Como el firmware muestrea cada 2 s y el
puente postea cada 5 s, el puente **suma** los deltas de las muestras
intermedias y solo limpia el acumulador cuando el POST devolvio 200. Si
fallara y reseteara, esa energia se perderia.

**DTR/RTS obligatorios.** El puente USB del mEDBG no entrega datos si el host
no levanta DTR y RTS. Un lector que no las active ve el puerto abierto y
silencio absoluto.

## Trampa: en esta placa el I2C NO esta en A4/A5

Vale documentarlo porque cuesta horas y es invisible.

En el Arduino UNO clasico, A4 y A5 **son** los pines del bus I2C. Por eso
todos los tutoriales de ADS1115 dicen "SDA -> A4, SCL -> A5".

En el UNO WiFi Rev2 eso es falso. Confirmado en el core, archivo
`packages/arduino/hardware/megaavr/1.8.8/variants/uno2018/pins_arduino.h`:

```c
#define PIN_WIRE_SDA  (20)   // PA2/TWI_SDA
#define PIN_WIRE_SCL  (21)   // PA3/TWI_SCL
#define PIN_A4        (18)
#define PIN_A5        (19)
```

El I2C vive en los pines dedicados `SDA` y `SCL`, los dos que estan al lado
de `AREF` en la punta del header digital. A4 y A5 son los pines 18 y 19:
analogicos puros, sin ninguna conexion al bus. Un ADS1115 cableado a A4/A5
en esta placa no aparece en el bus, y el cableado se ve identico al del
tutorial.

### Como verificarlo en 10 segundos

Un escaneo I2C que barra las 127 direcciones. En esta placa siempre
responde `0x60` — el ATECC608A, el chip criptografico que viene soldado.
Eso sirve de testigo:

- Aparece `0x60` y nada mas -> el bus funciona, pero tu periferico no esta
  conectado o no esta alimentado.
- No aparece nada, ni `0x60` -> el problema es `Wire` o los pines del micro.
- Aparece algo en `0x48`-`0x4B` -> el ADS1115 esta hablando.

### Sobre diagnosticar pines por software

Un pin analogico al aire **no se puede distinguir de forma confiable** de un
nodo real por software. Se probaron cuatro discriminadores y los cuatro
dieron falsos positivos:

1. Delta del pull-up interno: ciego si el pin flotante quedo cargado cerca
   de 5V, porque el pull-up ya no tiene margen.
2. Escaneo comparativo de A0..A5: el ADC multiplexa un solo conversor a
   traves de un capacitor de muestreo, y la carga residual de un canal
   contamina el siguiente. Los pines flotantes leen parecido y derivan
   juntos.
3. Estabilidad pico a pico en ventana de 1 s: la deriva es de ~1 cuenta por
   segundo, invisible en una ventana tan corta.
4. Deriva contra linea de base de 20 s: funciona solo durante el
   transitorio. Un pin flotante ya equilibrado esta genuinamente inmovil.

Lo unico confiable: **un pin flotante nunca satura el ADC.** Solo un riel
real de 5V da 1023 y solo `GND` real da 0. Para preguntar "¿esto tiene
alimentacion?" alcanza y sobra; para cualquier cosa del medio, mirar los
cables.
