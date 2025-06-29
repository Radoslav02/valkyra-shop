import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const navItems = [
  {
    label: "Početna",
    route: "/početna",
    subItems: [],
  },
  {
    label: "Venčanja, krštenja, rođendani",
    route: "/Venčanja, krštenja, rođendani",
    subItems: [
      {
        label: "Kutije za koverte i novac",
        route: "/podkategorija/Kutije za koverte i novac",
      },
      {
        label: "Table dobrodošlice i spisak gostiju",
        route: "/podkategorija/Table dobrodošlice i spisak gostiju",
      },
      {
        label: "Table za obeležavanje stolova",
        route: "/podkategorija/Table za obeležavanje stolova",
      },
      {
        label: "Toperi za tortu",
        route: "/podkategorija/Toperi za tortu",
      },
    ],
  },
  {
    label: "Reklamne table i pločice",
    route: "/Reklamne table i pločice",
    subItems: [
      {
        label: "Reklame table za firmu",
        route: "/podkategorija/Reklame table za firmu",
      },
      {
        label: "Moderni kućni brojevi",
        route: "/podkategorija/Moderni kućni brojevi",
      },
      {
        label: "Pločice za vrata i obeležavanje prostorija",
        route: "/podkategorija/Pločice za vrata i obeležavanje prostorija",
      },
      {
        label: "UV štampa reklamnog materijala",
        route: "/podkategorija/UV štampa reklamnog materijala",
      },
    ],
  },
  {
    label: "Štampa",
    route: "/štampa",
    subItems: [
      {
        label: "Štampa i sečenje nalepnica",
        route: "/podkategorija/Štampa i sečenje nalepnica",
      },
      {
        label: "Nalepnice za dečije sobe",
        route: "/podkategorija/Nalepnice za dečije sobe",
      },
      {
        label: "3D nalepnice - stikeri",
        route: "/podkategorija/3D nalepnice - stikeri",
      },
      { label: "Nalepnice za automobile", route: "/podkategorija/Nalepnice za automobile" },
    ],
  },
];

export default function NavBar() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Close any open dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        setActiveMobileDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (route: string) => {
    navigate(route);
    // Close mobile menu after navigation
    setMobileMenuOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label: string) => {
    setActiveMobileDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <nav ref={navRef}>
      {/* Desktop Menu */}
      <div className="desktop-menu">
        <div className="nav-bar-container">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="nav-item"
              onMouseEnter={() => {
                if (item.subItems.length > 0) setActiveDropdown(item.label);
              }}
              onMouseLeave={() => {
                setActiveDropdown(null);
              }}
              onClick={() => {
                if (item.subItems.length === 0) handleNavigate(item.route);
              }}
            >
              <h3 className="nav-item-label">
                {item.label}
                {item.subItems.length > 0 && (
                  <ArrowDropDownIcon
                    className={`dropdown-icon ${
                      activeDropdown === item.label ? "rotated" : ""
                    }`}
                  />
                )}
              </h3>
              {item.subItems.length > 0 && (
                <div
                  className={`dropdown-menu ${
                    activeDropdown === item.label ? "open" : ""
                  }`}
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className="dropdown-item"
                      onClick={() => handleNavigate(subItem.route)}
                    >
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="mobile-menu">
        <div
          className="hamburger-icon"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-nav-items">
            {navItems.map((item, index) => (
              <div key={index} className="mobile-nav-item">
                <div className="mobile-nav-item-header">
                  <h3
                    onClick={() => {
                      // If no sub-categories, navigate directly
                      if (item.subItems.length === 0)
                        handleNavigate(item.route);
                    }}
                  >
                    {item.label}
                  </h3>
                  {item.subItems.length > 0 && (
                    <button
                      className="mobile-dropdown-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMobileDropdown(item.label);
                      }}
                    >
                      {activeMobileDropdown === item.label ? "−" : "+"}
                    </button>
                  )}
                </div>
                {item.subItems.length > 0 &&
                  activeMobileDropdown === item.label && (
                    <div className="mobile-dropdown">
                      {item.subItems.map((subItem, subIndex) => (
                        <div
                          key={subIndex}
                          className="mobile-dropdown-item"
                          onClick={() => handleNavigate(subItem.route)}
                        >
                          {subItem.label}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
