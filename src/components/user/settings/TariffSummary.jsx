"use client";
import { FaExclamationTriangle } from "react-icons/fa";
import { formatCopPerKwh, formatTariffDate } from "@/lib/currency";

/*
 * De donde sale la tarifa aplicada. Muestra el CU y la contribucion por
 * separado, no solo el resultado: asi se puede explicar como se llego al
 * numero en vez de pedir que se le crea.
 */
export default function TariffSummary({ tariff }) {
  if (!tariff) {
    return (
      <div className="form-section">
        <p className="tariff-alert">
          <FaExclamationTriangle /> No hay cuadro tarifario cargado para esta
          combinación. El costo estimado va a aparecer en cero hasta que se cargue.
        </p>
      </div>
    );
  }

  const contribution =
    tariff.contributionRate > 0 && !tariff.exemptContribution
      ? ` + ${(tariff.contributionRate * 100).toFixed(0)}% de contribución`
      : " (sin contribución por exención)";

  return (
    <div className="form-section tariff-summary">
      <h3>Tarifa de referencia aplicada</h3>

      <p className="tariff-summary__rate">
        {formatCopPerKwh(tariff.appliedRateCopKwh)}
      </p>

      <p className="tariff-summary__breakdown">
        Costo Unitario {formatCopPerKwh(tariff.baseCuCopKwh)}
        {contribution} · vigente desde{" "}
        {formatTariffDate(tariff.validFrom, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <p className="tariff-summary__source">Fuente: {tariff.source}</p>

      {tariff.provisional && (
        <p className="tariff-alert">
          <FaExclamationTriangle /> Valor PROVISIONAL de desarrollo. Reemplazar
          por el cuadro tarifario publicado antes de presentar resultados.
        </p>
      )}
    </div>
  );
}
