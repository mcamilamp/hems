/*
 * Valores admitidos del perfil tarifario.
 *
 * El match entre Company y Tariff es por strings EXACTOS: un "comercial" en
 * minuscula o un "NT-1" no encuentra tarifa y la estimacion daria $0 sin que
 * nadie se entere. Por eso la UI ofrece selects contra estas listas y la API
 * valida contra las mismas: una sola fuente, cliente-safe (sin prisma).
 */

export const PROVIDERS = ["Air-e"];

// Mercado atendido por Air-e (Atlantico, Magdalena y La Guajira).
export const MARKETS = ["Magdalena", "Atlántico", "La Guajira"];

/*
 * El prototipo es para MIPYMES, y una mipyme es una empresa: no puede ser
 * usuario residencial, ni oficial (esa categoria es de entidades del Estado).
 * Quedan las dos que si puede ser -- un comercio o un taller pequeno.
 *
 * Esto limita lo que un cliente puede declararse, NO lo que la base puede
 * guardar: el modelo Tariff acepta cualquier categoria, asi que se pueden
 * cargar otros cuadros del comercializador si mas adelante hacen falta.
 */
export const CATEGORIES = ["Comercial", "Industrial"];

// NT1 = tension nominal menor a 1 kV, que es donde cae una mipyme conectada a
// la red de baja tension.
export const VOLTAGE_LEVELS = ["NT1", "NT2", "NT3", "NT4"];

export const TARIFF_OPTIONS = {
  provider: PROVIDERS,
  market: MARKETS,
  category: CATEGORIES,
  voltageLevel: VOLTAGE_LEVELS,
};

export function isValidProfileField(field, value) {
  const allowed = TARIFF_OPTIONS[field];
  return Array.isArray(allowed) && allowed.includes(value);
}
