export const cleanupLeafletMaps = () => {
  try {
    // Remove todos os mapas Leaflet ativos
    if (window.L) {
      // Limpa containers de mapa órfãos
      const mapContainers = document.querySelectorAll('.leaflet-container');
      mapContainers.forEach(container => {
        if (container._leaflet_id) {
          const map = window.L.map(container);
          if (map && map.remove) {
            map.remove();
          }
        }
      });

      // Limpa referências globais do Leaflet
      if (window.L.DomUtil && window.L.DomUtil._leafletId) {
        window.L.DomUtil._leafletId = 0;
      }
    }

    // Limpa timers pendentes que podem estar relacionados aos mapas
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }

    const highestIntervalId = setInterval(() => {}, 9999);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
    clearInterval(highestIntervalId);

  } catch (error) {
    console.warn('Erro durante limpeza dos mapas:', error);
  }
};

export const useMapCleanup = () => {
  const cleanup = () => {
    cleanupLeafletMaps();
  };

  return cleanup;
};