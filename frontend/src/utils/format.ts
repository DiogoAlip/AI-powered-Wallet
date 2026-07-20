/**
 * Formateador de moneda para Soles (S/) con puntuación latinoamericana.
 * Garantiza el uso de coma (,) para miles y punto (.) para decimales.
 */
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "S/ 0.00";
  }

  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);

  // Usamos el locale 'es-PE' que usa coma para miles y punto para decimales.
  // Como salvaguarda para cualquier navegador sin soporte de ICU completo,
  // si es-PE no aplica el formato esperado, se puede usar 'en-US' que garantiza la misma puntuación.
  const formattedVal = absoluteAmount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${sign}S/ ${formattedVal}`;
}

/**
 * Formatea un número con puntuación latinoamericana (separador de miles con coma y decimales con punto).
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("es-PE", options);
}
