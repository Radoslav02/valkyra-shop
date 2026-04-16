import React, { useState, useEffect } from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CategoryIcon from "@mui/icons-material/Category";
import { Checkbox, FormControlLabel, Box, Typography, Collapse } from "@mui/material";
import "./Filter.css";

type FilterProps = {
  availableDimensions: string[];
  onFilterChange: (filters: { dimensions: string[] }) => void;
  availableSubcategories?: string[];
  onSubcategoryFilterChange?: (subcategories: string[]) => void;
};

const useIsLargeScreen = () => {
  const [isLarge, setIsLarge] = useState(window.innerWidth > 768);
  useEffect(() => {
    const handler = () => setIsLarge(window.innerWidth > 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isLarge;
};

const Filter: React.FC<FilterProps> = ({
  availableDimensions,
  onFilterChange,
  availableSubcategories,
  onSubcategoryFilterChange,
}) => {
  const isLarge = useIsLargeScreen();
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [dimensionsOpen, setDimensionsOpen] = useState(isLarge);
  const [categoriesOpen, setCategoriesOpen] = useState(isLarge);

  useEffect(() => {
    setDimensionsOpen(isLarge);
    setCategoriesOpen(isLarge);
  }, [isLarge]);

  useEffect(() => {
    setSelectedDimensions((prev) =>
      prev.filter((d) => availableDimensions.includes(d))
    );
  }, [availableDimensions]);

  useEffect(() => {
    if (availableSubcategories) {
      setSelectedSubcategories((prev) =>
        prev.filter((s) => availableSubcategories.includes(s))
      );
    }
  }, [availableSubcategories]);

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimensions((prev) => {
      const newSelection = prev.includes(dimension)
        ? prev.filter((d) => d !== dimension)
        : [...prev, dimension];
      onFilterChange({ dimensions: newSelection });
      return newSelection;
    });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategories((prev) => {
      const newSelection = prev.includes(subcategory)
        ? prev.filter((s) => s !== subcategory)
        : [...prev, subcategory];
      onSubcategoryFilterChange?.(newSelection);
      return newSelection;
    });
  };

  return (
    <Box className="filter-container">
      {/* Subcategory filter */}
      {availableSubcategories && availableSubcategories.length > 0 && (
        <Box className="filter-section">
          <Box className="filter-header" onClick={() => setCategoriesOpen(!categoriesOpen)}>
            <Typography variant="h6" component="span" sx={{ ml: 1, color: "#121212b8" }}>
              Kategorije
            </Typography>
            <CategoryIcon color="secondary" />
          </Box>
          <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
            <Box className="filter-options">
              {availableSubcategories.map((s) => (
                <FormControlLabel
                  key={s}
                  control={
                    <Checkbox
                      checked={selectedSubcategories.includes(s)}
                      onChange={() => handleSubcategoryChange(s)}
                      color="primary"
                    />
                  }
                  label={s}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Dimensions filter */}
      {availableDimensions.length > 0 && (
        <Box className="filter-section">
          <Box className="filter-header" onClick={() => setDimensionsOpen(!dimensionsOpen)}>
            <Typography variant="h6" component="span" sx={{ ml: 1, color: "#121212b8" }}>
              Dimenzije
            </Typography>
            <FilterAltIcon color="secondary" />
          </Box>
          <Collapse in={dimensionsOpen} timeout="auto" unmountOnExit>
            <Box className="filter-options">
              {availableDimensions.map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={selectedDimensions.includes(d)}
                      onChange={() => handleDimensionChange(d)}
                      color="primary"
                    />
                  }
                  label={d}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default Filter;
