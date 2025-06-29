import React, { useState, useEffect } from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Checkbox, FormControlLabel, Box, Typography, Collapse } from "@mui/material";
import "./Filter.css";

type FilterProps = {
  // The parent passes the current dimensions list,
  // derived from the up-to-date products array
  availableDimensions: string[];

  // When the user toggles a dimension checkbox,
  // we notify the parent with the selected list
  onFilterChange: (filters: { dimensions: string[] }) => void;
};

const Filter: React.FC<FilterProps> = ({
  availableDimensions,
  onFilterChange,
}) => {
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Whenever the parent changes the availableDimensions list,
  // decide how to update the local "selected" list.
  useEffect(() => {
    setSelectedDimensions((prev) =>
      prev.filter((d) => availableDimensions.includes(d))
    );
  }, [availableDimensions]);

  // Toggle selection
  const handleCheckboxChange = (dimension: string) => {
    setSelectedDimensions((prev) => {
      let newSelection;
      if (prev.includes(dimension)) {
        newSelection = prev.filter((d) => d !== dimension);
      } else {
        newSelection = [...prev, dimension];
      }

      // Notify the parent about the new selection
      onFilterChange({ dimensions: newSelection });
      return newSelection;
    });
  };

  return (
    <Box className="filter-container">
      <Box className="filter-header" onClick={() => setDrawerOpen(!drawerOpen)}>
        <Typography variant="h6" component="span" sx={{ ml: 1, color:'#121212b8' }}>
          Dimenzije
        </Typography>
        <FilterAltIcon color="secondary" />
      </Box>

      <Collapse in={drawerOpen} timeout="auto" unmountOnExit>
        <Box className="filter-options">
          {availableDimensions?.map((d) => (
            <FormControlLabel
              key={d}
              control={
                <Checkbox
                  checked={selectedDimensions.includes(d)}
                  onChange={() => handleCheckboxChange(d)}
                  color="primary"
                />
              }
              label={d}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default Filter;
