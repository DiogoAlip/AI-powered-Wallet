# Reglas del Proyecto (Workspace Rules)

Este archivo define reglas específicas de diseño, interfaz y comportamiento para cualquier agente de inteligencia artificial (o programador) que modifique este repositorio.

## Reglas de Moneda y Formato Numérico

1. **Moneda Oficial**: La moneda oficial de la aplicación es el Sol peruano (**S/**). No se debe usar el dólar ($) ni ninguna otra divisa en el frontend, backend ni la documentación del sistema.
2. **Formato Decimal Latinoamericano**: Todos los montos de dinero representados y formateados para el usuario final deben seguir la puntuación decimal latinoamericana estándar:
   - Separador de miles: punto (`.`)
   - Separador de decimales: coma (`,`)
   - Ejemplo de formato correcto: `S/ 1.234,56`
   - Ejemplo de formato incorrecto: `S/ 1,234.56`
3. **Funciones de Formato**:
   - En el frontend, utiliza siempre las funciones `formatCurrency` y `formatNumber` definidas en [format.ts](file:///c:/Users/fabri/AI-powered-finances/frontend/src/utils/format.ts). No uses formateos locales `toLocaleString` directamente en componentes de forma ad-hoc para evitar inconsistencias entre navegadores.
   - En el backend, utiliza la función `formatCurrencyBackend` para formatear los valores que se inyectan en prompts o se envían a Gemini.
4. **Instrucciones a la IA (Gemini)**:
   - Al configurar los prompts de sistema o instrucciones para la IA en el backend (por ejemplo en [gemini.js](file:///c:/Users/fabri/AI-powered-finances/backend/src/gemini.js)), se le debe recordar explícitamente al modelo que debe formatear todas las respuestas financieras en soles (S/) usando el formato decimal latinoamericano (punto para miles, coma para decimales).
   - Los parámetros numéricos y argumentos de llamadas a funciones (Function Calling) deben permanecer como números de punto flotante estándar de JavaScript (`NUMBER` de JSON, ej. `18.75`).
