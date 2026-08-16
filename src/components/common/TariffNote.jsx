"use client";
import { formatCopPerKwh, formatTariffDate } from "@/lib/currency";

/*
 * Supuesto a la vista: junto a todo costo estimado se muestra con que tarifa
 * fue calculado. Una estimacion que declara su insumo es defendible; un numero
 * suelto invita a preguntar de donde salio.
 */
export default function TariffNote({ tariff, uncoveredKwh = 0 }) {
  if (!tariff) {
    return (
      <p className="tariff-note tariff-note--warning">
        Sin cuadro tarifario cargado para el perfil de la empresa: el costo no
        puede estimarse.
      </p>
    );
  }

  const validFrom = formatTariffDate(tariff.validFrom, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="tariff-note">
      <p>
        Tarifa de referencia {formatCopPerKwh(tariff.appliedRateCopKwh)} ·{" "}
        {tariff.provider} · {tariff.category} · {tariff.voltageLevel} · vigente
        desde {validFrom}
      </p>
      {tariff.provisional && (
        <p className="tariff-note--warning">
          Tarifa PROVISIONAL de desarrollo, pendiente de verificar contra la
          publicación oficial.
        </p>
      )}
      {uncoveredKwh > 0 && (
        <p className="tariff-note--warning">
          {uncoveredKwh} kWh del período quedaron fuera de toda vigencia
          cargada: la estimación está incompleta.
        </p>
      )}
    </div>
  );
}
