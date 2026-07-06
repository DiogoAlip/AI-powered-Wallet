# SpendWise AI — Billetera Inteligente con Inteligencia Artificial

SpendWise AI es una plataforma moderna e inteligente para la gestión de finanzas personales. Diseñada para profesionales y usuarios que buscan optimizar su salud financiera, la aplicación combina el registro de transacciones con un asistente conversacional inteligente impulsado por IA, control presupuestario y seguimiento de metas de ahorro.

---

## 🚀 Características Principales

1. **Página de Inicio (Landing Page):** Presentación atractiva y moderna con tarifas transparentes, testimonios y visualización del ecosistema del producto.
2. **Asistente de IA (Chat):** Chatbot interactivo que parsea lenguaje natural (ej. _"Cena de $45 en Green Cafe"_), registra transacciones automáticamente e identifica oportunidades de ahorro.
3. **Historial de Movimientos:** Panel integral con métricas en tiempo real (Balance Neto, Ingresos y Gastos Totales), buscador de establecimientos, filtros por categoría o tipo de flujo, y la posibilidad de añadir registros de forma manual.
4. **Límites de Presupuesto:** Control de gastos por categorías con alertas de consumo progresivo (al llegar al 75% y sobrepasar el 100%) y una línea temporal para comparar el ritmo de gasto frente al avance de la semana.
5. **Metas de Ahorro:** Rastreador de metas (ej. _Fondo de Emergencia_), progreso interactivo con depósito simulado y configuración de notificaciones proactivas de IA.

---

## 🛠️ Requisitos de Ejecución

Antes de iniciar el proyecto, asegúrate de tener instalado:

- **Node.js** (Versión 18.0 o superior recomendada)
- Un gestor de paquetes como **npm** (incluido con Node) o **pnpm** (recomendado para un rendimiento óptimo).

---

## 💻 Comandos de Instalación y Ejecución

Sigue estos pasos para levantar el entorno local:

### 1. Clonar e Instalar Dependencias

Accede a la carpeta raíz del proyecto y ejecuta:

```bash
git clone https://github.com/DiogoAlip/AI-powered-Wallet.git

npm install
# o si usas pnpm:
pnpm install
```

### 2. Ejecutar Servidor de Desarrollo

Levanta la aplicación localmente en modo desarrollo con Vite:

```bash
npm run dev
# o con pnpm:
pnpm dev
```

La consola te proporcionará una URL local (comúnmente `http://localhost:5173`) para abrirla en el navegador.

---

## 📖 Manual de Usuario

### 1. Iniciar el Uso

- **Página de Inicio:** Al abrir la aplicación, verás la pantalla de presentación de SpendWise AI. Haz clic en **Comenzar** o **Comenzar Gratis** para ingresar a la interfaz del Dashboard.
- **Menú Lateral (Sidebar):** Permite cambiar de sección rápidamente entre:
  - **Chat con IA:** Para chatear con el asistente y registrar gastos rápidamente.
  - **Movimientos:** Para ver la lista completa de tus transacciones y balances.
  - **Límites:** Para monitorizar el estado de tus presupuestos por categorías.
  - **Ahorros:** Para realizar depósitos ficticios a tu Fondo de Emergencia y configurar alertas.

### 2. Registrar Transacciones

Existen dos métodos para registrar un movimiento:

- **Por Chat de Lenguaje Natural (Recomendado):** Ve al módulo _Chat_, escribe un mensaje como _"Gasté $25 en Uber Trip hoy"_ o _"Comida por $12 en Starbucks"_. El asistente interpretará la información, mostrará la tarjeta de gasto procesada en pantalla y la agregará automáticamente a tu historial.
- **Registro Manual:** Ve al módulo _Movimientos_, presiona el botón **Nuevo Registro**, rellena el establecimiento, categoría, cantidad y cuenta de origen, y presiona **Guardar**.

### 3. Controlar el Presupuesto

- En la sección _Límites_, podrás observar el progreso en barras de colores según la categoría:
  - **Verde:** Gasto saludable por debajo del 75%.
  - **Amarillo:** Gasto en zona de advertencia (75% - 100%).
  - **Rojo:** Presupuesto excedido (superior al 100%).
- Utiliza el indicador visual de **Paso de Presupuesto Semanal** para comprobar si vas demasiado rápido en tus gastos comparando tu consumo con el día actual de la semana.

### 4. Cumplir tus Metas de Ahorro

- En la pestaña _Ahorros_, visualiza el progreso acumulado de tu meta (ej. _Fondo de Emergencia_).
- Usa el simulador de depósitos rápidos para ingresar montos directamente (ej. $100) y ver el avance del porcentaje de tu meta de ahorro.
- Activa o desactiva las sugerencias e informes financieros proactivos generados por la IA utilizando los interruptores (_toggles_) de configuración.
