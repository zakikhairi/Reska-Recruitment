"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#lowongan", label: "Lowongan" },
    { href: "/#tentang", label: "Tentang Kami" },
    { href: "/#kontak", label: "Kontak" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || variant === "dashboard"
          ? "bg-white shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/_logo_kais.png" alt="KAI Services" className="w-16 h-16 object-contain" />
            <div>
              <div className="text-lg font-bold text-[#00205B]">KAI Services</div>
              <div className="text-[10px] text-gray-500 -mt-0.5">Smart Recruitment</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {variant === "landing" && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-600 hover:text-[#00205B]"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                isScrolled
                  ? "text-[#00205B] hover:text-[#003380]"
                  : "text-white hover:text-white/90"
              }`}
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#FF5E00] hover:bg-[#e65100] rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled || variant === "dashboard"
                ? "text-[#00205B] hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-2">
              {variant === "landing" && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#00205B] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/auth/login"
                  className="px-4 py-3 text-sm font-semibold text-center text-[#00205B] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-3 text-sm font-semibold text-center text-white bg-[#FF5E00] rounded-xl hover:bg-[#e65100] transition-all"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
