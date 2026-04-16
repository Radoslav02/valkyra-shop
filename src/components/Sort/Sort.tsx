import React, { useState } from "react";
import SortIcon from "@mui/icons-material/Sort";
import { Box, Typography, Collapse } from "@mui/material";
import "./Sort.css";

interface SortProps {
  onSortChange: (sortBy: string) => void;
}

const sortOptions = [
  { value: "nameAsc", label: "Naziv: A-Z" },
  { value: "nameDesc", label: "Naziv: Z-A" },
  { value: "priceAsc", label: "Cena: manja-veća" },
  { value: "priceDesc", label: "Cena: veća-manja" },
];

const Sort: React.FC<SortProps> = ({ onSortChange }) => {
  const [sortValue, setSortValue] = useState("nameAsc");
  const [open, setOpen] = useState(window.innerWidth > 768);

  const handleSelect = (value: string) => {
    setSortValue(value);
    onSortChange(value);
  };

  return (
    <Box className="sort-container">
      <Box className="sort-header" onClick={() => setOpen(!open)}>
        <Typography variant="h6" component="span" sx={{ ml: 1, color: "#121212b8" }}>
          Sortiraj
        </Typography>
        <SortIcon color="secondary" />
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box className="sort-options">
          {sortOptions.map((opt) => (
            <div
              key={opt.value}
              className={`sort-option ${sortValue === opt.value ? "sort-option-active" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default Sort;
