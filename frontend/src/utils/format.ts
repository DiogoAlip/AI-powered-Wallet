/**
 * Formateador de moneda para Soles (S/) con puntuación latinoamericana.
 * Garantiza el uso de punto (.) para miles y coma (,) para decimales.
 */
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "S/ 0,00";
  }

  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);

  // Formateamos usando fixed a 2 decimales
  const parts = absoluteAmount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1];

  return `${sign}S/ ${integerPart},${decimalPart}`;
}

/**
 * Formatea un número con puntuación latinoamericana (separador de miles con punto y decimales con coma).
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  // Obtenemos el formato base de en-US (que usa coma para miles y punto para decimales de forma estable)
  const formattedEn = value.toLocaleString("en-US", options);

  // Intercambiamos los separadores:
  // Reemplazamos coma por un marcador temporal, luego punto por coma, y finalmente el marcador temporal por punto.
  const tempMarker = "__TEMP_COMMA__";
  return formattedEn
    .replace(/,/g, tempMarker)
    .replace(/\./g, ",")
    .replace(new RegExp(tempMarker, "g"), ".");
}
