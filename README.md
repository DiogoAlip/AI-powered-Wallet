# FinancIA! — Sistema de Gestión Financiera con Inteligencia Artificial

FinancIA! es una plataforma moderna e inteligente para la gestión de finanzas personales. Diseñada para profesionales y usuarios que buscan optimizar su salud financiera, la aplicación combina el registro de transacciones con un asistente conversacional inteligente impulsado por IA, control presupuestario y seguimiento de metas de ahorro.

El proyecto está dividido en dos partes principales:
1. **Frontend**: Una SPA moderna desarrollada en React con TypeScript, Vite, TailwindCSS v4 y Zustand para el manejo del estado global.
2. **Backend**: Un servidor Express (Node.js) con base de datos SQLite (usando la API nativa `node:sqlite`) y soporte para consultas del asistente mediante la API de Gemini. En producción, este servidor está preparado para servir de forma unificada tanto la API REST (backend) como la aplicación compilada (frontend).

---

## Características Principales

1. **Página de Inicio (Landing Page):** Presentación atractiva y moderna con tarifas transparentes, testimonios y visualización del ecosistema del producto.
2. **Asistente de IA (Chat):** Chatbot interactivo que parsea lenguaje natural (ej. _"Cena de S/ 45,00 en Green Cafe"_), registra transacciones automáticamente e identifica oportunidades de ahorro.
3. **Historial de Movimientos:** Panel integral con métricas en tiempo real (Balance Neto, Ingresos y Gastos Totales), buscador de establecimientos, filtros por categoría o tipo de flujo, y la posibilidad de añadir registros de forma manual.
4. **Límites de Presupuesto:** Control de gastos por categorías con alertas de consumo progresivo (al llegar al 75% y sobrepasar el 100%) y una línea temporal para comparar el ritmo de gasto frente al avance de la semana.
5. **Metas de Ahorro:** Rastreador de metas (ej. _Fondo de Emergencia_), progreso interactivo con depósito simulado y configuración de notificaciones proactivas de IA.

---

## Requisitos de Ejecución

Antes de iniciar el proyecto, asegúrate de tener instalado:

- **Node.js** (Versión 22.5.0 o superior, requerida para el soporte nativo de `node:sqlite`).
- Un gestor de paquetes como **npm** (incluido con Node) o **pnpm**.
- Una clave de API de Gemini (**GEMINI_API_KEY**) para la funcionalidad del asistente de IA.

---

## Comandos de Instalación y Ejecución

Al estar estructurado como un proyecto con frontend y backend separados en directorios independientes, la instalación y ejecución difiere si se está en desarrollo o en producción.

### 1. Clonar el Proyecto

Accede a tu terminal y ejecuta:

```bash
git clone https://github.com/DiogoAlip/AI-powered-finances.git
cd AI-powered-finances
```

### 2. Configurar Variables de Entorno

En la carpeta `backend`, crea un archivo llamado `.env` basado en `.env.example` y define tu clave de API de Gemini:

```env
PORT=3000
GEMINI_API_KEY=tu_clave_de_api_aqui
DATABASE_PATH=./data/finances.db
CORS_ORIGIN=http://localhost:5173
```

### 3. Ejecución en Entorno de Desarrollo

Para trabajar en desarrollo, debes iniciar ambos servicios por separado para habilitar funciones como la recarga rápida (HMR):

#### Iniciar el Backend:
```bash
cd backend
npm install
npm run dev
```
Esto levantará la API de desarrollo en `http://localhost:3000`.

#### Iniciar el Frontend:
```bash
cd ../frontend
npm install
npm run dev
```
La consola te proporcionará una URL local (comúnmente `http://localhost:5173`) para abrirla en el navegador. La configuración de Vite está lista para redirigir las llamadas de `/api` al backend.

### 4. Ejecución en Producción (Servidor Único)

El servidor backend está configurado para servir tanto la API REST como la aplicación de React ya construida. Para ejecutarlo de esta manera:

#### Construir el Frontend:
```bash
cd frontend
npm install
npm run build
```
Esto compilará la SPA en la carpeta `frontend/dist`.

#### Levantar el Servidor Backend:
```bash
cd ../backend
npm install
npm run start
```
El servidor backend escuchará en el puerto configurado (puerto 3000 por defecto) y servirá el frontend de manera unificada en la ruta raíz (`http://localhost:3000`), además de las rutas correspondientes de la API `/api/*`.

---

## Manual de Usuario

### 1. Iniciar el Uso

- **Página de Inicio:** Al abrir la aplicación, verás la pantalla de presentación de FinancIA!. Haz clic en **Comenzar** o **Comenzar Gratis** para ingresar a la interfaz del Dashboard.
- **Menú Lateral (Sidebar):** Permite cambiar de sección rápidamente entre:
  - **Nuevo Chat:** Para iniciar una conversación con el asistente inteligente y registrar gastos en lenguaje natural.
  - **Estadísticas y Límites:** Para monitorizar tus presupuestos por categorías, alertas de consumo y comparar tu ritmo de gasto semanal.
  - **Historial de Gastos:** Para visualizar la lista completa de transacciones y balances de forma organizada.
  - **Metas de Ahorro:** Para simular depósitos hacia tu Fondo de Emergencia y configurar las alertas de la IA.

### 2. Registrar Transacciones

Existen dos métodos para registrar un movimiento:

- **Por Chat de Lenguaje Natural (Recomendado):** Ve al módulo de chat, escribe un mensaje como _"Gasté S/ 25,00 en Uber Trip hoy"_ o _"Comida por S/ 12,00 en Starbucks"_. El asistente interpretará la información, mostrará la tarjeta de gasto procesada en pantalla y la agregará automáticamente a tu historial.
- **Registro Manual:** Ve al módulo **Historial de Gastos**, presiona el botón **Nuevo Registro**, rellena el establecimiento, categoría, cantidad y cuenta de origen, y presiona **Guardar**.

### 3. Controlar el Presupuesto

- En la sección **Estadísticas y Límites**, podrás observar el progreso en barras de colores según la categoría:
  - **Verde:** Gasto saludable por debajo del 75%.
  - **Amarillo:** Gasto en zona de advertencia (75% - 100%).
  - **Rojo:** Presupuesto excedido (superior al 100%).
- Utiliza el indicador visual de **Paso de Presupuesto Semanal** para comprobar si vas demasiado rápido en tus gastos comparando tu consumo con el día actual de la semana.

### 4. Cumplir tus Metas de Ahorro

- En la pestaña **Metas de Ahorro**, visualiza el progreso acumulado de tu meta (ej. Fondo de Emergencia).
- Usa el simulador de depósitos rápidos para ingresar montos directamente (ej. S/ 100,00) y ver el avance del porcentaje de tu meta de ahorro.
- Activa o desactiva las sugerencias e informes financieros proactivos generados por la IA utilizando los interruptores (toggles) de configuración.
