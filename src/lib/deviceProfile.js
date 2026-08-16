import { formatCop } from "@/lib/currency";

/*
 * Mapea la respuesta de /api/devices/[id] a lo que dibuja la pantalla de
 * detalle. Vive fuera del componente porque es transformacion pura de datos:
 * la pagina ya pasaba el techo de lineas mezclando ambas cosas.
 */
export function toProfile(device) {
  const consumptions = device.consumptions || [];
  const totalConsumption = consumptions.reduce((acc, c) => acc + c.value, 0);
  const lastConsumption = consumptions[0]?.value || 0;

  return {
    deviceData: {
      id: device.id,
      name: device.name,
      type: device.type,
      location: device.location || "Sin ubicación",
      status: device.status,
      user: device.user?.name || "Sin asignar",
      userId: device.userId,
      brand: "Generic", // Placeholder
      model: "IoT Device", // Placeholder
      power: "N/A",
      registeredDate: new Date(device.createdAt).toLocaleDateString(),
      lastActive: device.updatedAt ? new Date(device.updatedAt).toLocaleString() : "Nunca",
      firmwareVersion: "v1.0",
      apiToken: device.apiToken // Show API Token
    },
    metrics: {
      currentConsumption: `${lastConsumption.toFixed(2)} kWh`,
      todayConsumption: `${(totalConsumption * 0.3).toFixed(2)} kWh`, // Simulated proportion
      monthlyConsumption: `${totalConsumption.toFixed(2)} kWh`,
      // Calculado en el servidor con la tarifa vigente por tramo. Antes esta
      // pantalla hacia su propia cuenta con una constante suelta.
      monthlyCost: formatCop(device.estimate?.estimatedCostCop ?? 0),
      tariff: device.estimate?.tariff ?? null,
      averageDaily: `${(totalConsumption / (consumptions.length || 1)).toFixed(2)} kWh`,
      efficiency: "90%",
    },
  };
}
