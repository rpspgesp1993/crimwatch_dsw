import React from 'react';

const LegendControl = () => (
  <div style={{
    background: 'white', padding: '8px', lineHeight: '1.5', borderRadius: '8px',
    boxShadow: '0 0 6px rgba(0,0,0,0.3)', margin: '8px'
  }}>
    <strong>Incidência de Crimes</strong>
    <div><span style={{ background: '#ff0000', padding: '4px' }}></span> Muito alta</div>
    <div><span style={{ background: '#ffa500', padding: '4px' }}></span> Alta</div>
    <div><span style={{ background: '#ffff00', padding: '4px' }}></span> Média</div>
    <div><span style={{ background: '#00ff00', padding: '4px' }}></span> Baixa</div>
  </div>
);

export default LegendControl;
