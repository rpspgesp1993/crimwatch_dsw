import React from 'react';
import { FormControlLabel, Switch, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TiposOcorrencias = ({ tiposSelecionados, setTiposSelecionados }) => {
  const tipos = ['Roubos', 'Furtos', 'Estupro', 'PolicialMorto'];

  const handleToggle = (tipo) => {
    setTiposSelecionados((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">Tipos de Ocorrências</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {tipos.map((tipo) => (
          <FormControlLabel
            key={tipo}
            control={
              <Switch
                checked={tiposSelecionados[tipo] || false}
                onChange={() => handleToggle(tipo)}
              />
            }
            label={tipo}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default TiposOcorrencias;
