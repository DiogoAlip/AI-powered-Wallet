const bienvenidasSinNombre = [
  "¡Hola! ¿En qué puedo ayudarte hoy?",
  "¡Buenas! ¿Qué tenemos en mente para hoy?",
  "Mucho gusto ¿Con qué empezamos?",
  "Dime, ¿cómo te puedo dar una mano?",
  "¡Hola, hola! ¿De que se trata hoy?",
  "¡Cuando gustes!",
  "Cuéntame, ¿En qué te puedo colaborar hoy?",
];

const bienvenidasConNombre = [
  `¡Hola, usuario! ¿En qué te puedo ayudar hoy?`,
  `¡Buenas, usuario! ¿Qué proyecto tenemos entre manos?`,
  `¡Hola, usuario! ¿De que se trata esta vez?`,
  `¡Hola, usuario! ¿cómo puedo colaborar?`,
  `¡Buenas, usuario! ¿Qué necesitas?`,
  `¡Hola, usuario! ¿en qué andas?`,
  `¡Ey, usuario! ¿En que te ayudo?`,
];

export function randomWelcomePhrase(user?: string) {
  const randomIndex = Math.floor(Math.random() * 7);
  return user
    ? bienvenidasConNombre[randomIndex].replace("usuario", user)
    : bienvenidasSinNombre[randomIndex];
}
