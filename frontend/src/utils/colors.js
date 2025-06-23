// src/utils/colors.js
export function getColorByIndice(indice) {
  if (indice > 300) return '#800026';      // vermelho escuro
  if (indice > 200) return '#BD0026';
  if (indice > 100) return '#E31A1C';
  if (indice > 50) return '#FC4E2A';
  if (indice > 20) return '#FD8D3C';
  if (indice > 10) return '#FEB24C';
  if (indice > 0) return '#FED976';
  return '#31a354'; // verde
}
