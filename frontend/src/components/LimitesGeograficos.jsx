import React from 'react';
import { FormControlLabel, Switch, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const LimitesGeograficos = ({ showMunicipios, setShowMunicipios, showBairros, setShowBairros }) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">Limites Geográficos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControlLabel
          control={
            <Switch
              checked={showMunicipios}
              onChange={(e) => setShowMunicipios(e.target.checked)}
            />
          }
          label="Municípios"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showBairros}
              onChange={(e) => setShowBairros(e.target.checked)}
            />
          }
          label="Bairros"
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default LimitesGeograficos;
