import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  Search,
  Zap,
  LogIn,
  LogOut,
  Map,
  User,
  UserPlus,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Category } from "../types";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  onSelectCategory: (
    category: Category | "All" | "Tech" | "Accessories",
  ) => void;
  selectedCategory: Category | "All" | "Tech" | "Accessories";
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onGoHome: () => void;
  onOpenTechOfTheDay: () => void;
}

export function Header({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenTracking,
  onOpenProfile,
  onOpenAuth,
  onOpenAbout,
  onOpenTechOfTheDay,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  setSearchQuery,
  onGoHome,
}: HeaderProps) {
  const { user, role, logOut } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<
    "tech" | "accessories" | "tech_m" | "accessories_m" | null
  >(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    setOpenDropdown(null);
  };

  const handleLogoClick = () => {
    onGoHome();
    setOpenDropdown(null);
  };

  const handleShopClick = () => {
    onGoHome();
    setOpenDropdown(null);
  };

  const handleAboutClick = () => {
    onOpenAbout();
    setOpenDropdown(null);
  };

  const handleTrackingClick = () => {
    onOpenTracking();
    setOpenDropdown(null);
  };

  const handleProfileClick = () => {
    onOpenProfile();
    setOpenDropdown(null);
  };

  const handleAdminClick = () => {
    onOpenAdmin();
    setOpenDropdown(null);
  };

  const handleAuthClick = () => {
    onOpenAuth();
    setOpenDropdown(null);
  };

  const handleCartClick = () => {
    onOpenCart();
    setOpenDropdown(null);
  };

  const handleLogOut = () => {
    logOut();
    setOpenDropdown(null);
  };

  return (
    <header
      ref={dropdownRef}
      className="sticky top-0 z-50 w-full border-b border-neutral-900 bg-neutral-950"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 font-black text-2xl tracking-tighter text-white cursor-pointer group font-serif uppercase"
        >
          {/* Logo Image */}
          <img
            src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"
            alt="Tizzitech Logo"
            className="h-7 w-7 object-cover rounded-full"
          />
          <span>Tizzitech</span>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex flex-wrap justify-center flex-1 mx-2 items-center gap-2 lg:gap-6 text-[10px] lg:text-sm font-semibold tracking-widest uppercase text-neutral-400">
          <div className="relative">
            <button
              onClick={() => {
                setOpenDropdown(openDropdown === "tech" ? null : "tech");
                onSelectCategory("Tech");
              }}
              className={`hover:text-white transition-colors flex items-center gap-1 ${openDropdown === "tech" || selectedCategory === "Tech" ? "text-white font-bold" : ""}`}
            >
              Tizzitech Store{" "}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown === "tech" ? "rotate-180" : ""}`}
              />
            </button>
            {openDropdown === "tech" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => handleCategoryClick("Laptops")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Laptops
                </button>
                <button
                  onClick={() => handleCategoryClick("Phones")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Phones
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setOpenDropdown(
                  openDropdown === "accessories" ? null : "accessories",
                );
                onSelectCategory("Accessories");
              }}
              className={`hover:text-white transition-colors flex items-center gap-1 ${openDropdown === "accessories" || selectedCategory === "Accessories" ? "text-white font-bold" : ""}`}
            >
              Accessories{" "}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openDropdown === "accessories" ? "rotate-180" : ""}`}
              />
            </button>
            {openDropdown === "accessories" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => handleCategoryClick("Earpod")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Earpods
                </button>
                <button
                  onClick={() => handleCategoryClick("Earpiece")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Earpieces
                </button>
                <button
                  onClick={() => handleCategoryClick("Keyboards")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Keyboards
                </button>
                <button
                  onClick={() => handleCategoryClick("Mouse")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Mice / Mouse
                </button>
                <button
                  onClick={() => handleCategoryClick("Case Protector")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Pouch / Case Protector
                </button>
                <button
                  onClick={() => handleCategoryClick("Screen Guard")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Screen Guard
                </button>
                <button
                  onClick={() => handleCategoryClick("Chargers")}
                  className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-white transition-colors"
                >
                  Chargers
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onOpenTechOfTheDay();
              setOpenDropdown(null);
            }}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Tech of the day
          </button>
          <button
            onClick={handleAboutClick}
            className="hover:text-white transition-colors"
          >
            About
          </button>
          <button
            onClick={handleTrackingClick}
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Track Order
          </button>
        </nav>

        <div className="flex items-center justify-end gap-3 md:gap-4 lg:gap-6 min-w-0">
          <div className="hidden md:block w-32 lg:w-64 shrink">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type="text"
                className="block w-full border-b border-neutral-800 bg-transparent py-1.5 pl-9 pr-3 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none sm:text-sm transition-colors"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {user && (
            <button
              onClick={handleProfileClick}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Profile"
            >
              <User className="h-5 w-5" />
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={handleAdminClick}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Admin Dashboard"
            >
              <Package className="h-5 w-5" />
            </button>
          )}

          {user ? (
            <button
              onClick={handleLogOut}
              className="text-neutral-400 hover:text-blue-500 transition-colors"
              title="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Sign In / Register"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={handleCartClick}
            className="relative text-neutral-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav & Search */}
      <div className="md:hidden flex flex-col px-4 pb-4 border-b border-neutral-900 bg-black sticky top-0 z-40">
        <div className="flex items-center gap-3 pt-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              className="block w-full border border-neutral-800 rounded bg-neutral-900 py-2 pl-9 pr-3 text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none sm:text-sm transition-colors"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {user ? (
            <button
              onClick={handleProfileClick}
              className="bg-neutral-900 border border-neutral-800 p-2 rounded text-emerald-400 hover:text-white transition-colors flex flex-col items-center justify-center shrink-0"
              title="Profile"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleAuthClick}
              className="bg-neutral-900 border border-neutral-800 p-2 rounded text-neutral-400 hover:text-white transition-colors flex flex-col items-center justify-center shrink-0"
              title="Sign In / Register"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={handleCartClick}
            className="relative bg-neutral-900 border border-neutral-800 p-2 rounded text-neutral-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-neutral-900 border border-neutral-800 p-2 rounded text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 relative z-50 bg-black pb-2">
            <nav className="flex flex-col gap-1 text-[11px] font-bold tracking-widest uppercase text-neutral-400">
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setOpenDropdown(
                      openDropdown === "tech_m" ? null : "tech_m",
                    );
                    onSelectCategory("Tech");
                  }}
                  className={`w-full text-left py-3 px-3 hover:bg-neutral-900 transition-colors flex items-center justify-between bg-neutral-950 mt-1 rounded ${openDropdown === "tech_m" || selectedCategory === "Tech" ? "text-white" : ""}`}
                >
                  Tizzitech Store{" "}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openDropdown === "tech_m" ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === "tech_m" && (
                  <div className="bg-neutral-900/50 border-x border-b border-neutral-800 py-2 px-6 rounded-b">
                    <button
                      onClick={() => {
                        handleCategoryClick("Laptops");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2.5 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Laptops
                    </button>
                    <div className="h-px bg-neutral-800/50 w-full my-0.5"></div>
                    <button
                      onClick={() => {
                        handleCategoryClick("Phones");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2.5 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Phones
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setOpenDropdown(
                      openDropdown === "accessories_m" ? null : "accessories_m",
                    );
                    onSelectCategory("Accessories");
                  }}
                  className={`w-full text-left py-3 px-3 hover:bg-neutral-900 transition-colors flex items-center justify-between bg-neutral-950 mt-1 rounded ${openDropdown === "accessories_m" || selectedCategory === "Accessories" ? "text-white" : ""}`}
                >
                  Accessories{" "}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${openDropdown === "accessories_m" ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === "accessories_m" && (
                  <div className="bg-neutral-900/50 border-x border-b border-neutral-800 py-3 px-6 rounded-b grid grid-cols-2 gap-x-4 gap-y-1">
                    <button
                      onClick={() => {
                        handleCategoryClick("Earpod");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Earpods
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Earpiece");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Earpieces
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Keyboards");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Keyboards
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Mouse");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Mice
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Case Protector");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest leading-tight"
                    >
                      Pouch
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Screen Guard");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest leading-tight"
                    >
                      Screen Guard
                    </button>
                    <button
                      onClick={() => {
                        handleCategoryClick("Chargers");
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 hover:text-white text-neutral-300 transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      Chargers
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onOpenTechOfTheDay();
                  setOpenDropdown(null);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-blue-400"
              >
                Tech of the day
              </button>
              <button
                onClick={() => {
                  handleAboutClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1"
              >
                About
              </button>
              <button
                onClick={() => {
                  handleTrackingClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-pink-500"
              >
                Track Order
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      handleProfileClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-emerald-400"
                  >
                    Profile
                  </button>
                  {role === "admin" && (
                    <button
                      onClick={() => {
                        handleAdminClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-purple-400"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-red-500"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-3 px-3 hover:bg-neutral-900 hover:text-white rounded transition-colors bg-neutral-950 mt-1 text-emerald-400"
                >
                  Sign In / Register
                </button>
              )}
            </nav>
          </div>
        )}
        {/* End Mobile Menu Content */}
      </div>
    </header>
  );
}
