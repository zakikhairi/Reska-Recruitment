"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, LogIn } from "lucide-react";

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  // Don't render until mounted (to avoid hydration mismatch)
  if (!isMounted) {
    return (
      <header className="h-20 bg-transparent"></header>
    );
  }

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
            <img src="/_logo_kais.png" alt="KAI Services" className="w-14 h-14 object-contain" />
            <div className="hidden sm:block">
              <div className="text-base sm:text-lg font-bold text-[#00205B]">KAI Services</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 -mt-0.5">Smart Recruitment</div>
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

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className={`px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
                isScrolled
                  ? "text-[#00205B] hover:text-[#003380]"
                  : "text-white hover:text-white/90"
              }`}
            >
              <LogIn className="w-4 h-4" />
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
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:hidden
        `}>
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img src="/_logo_kais.png" alt="KAI Services" className="w-10 h-10 object-contain" />
              <span className="font-bold text-[#00205B]">Menu</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="p-4">
            {variant === "landing" && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigasi</h3>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-[#00205B] font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Auth Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-center text-[#00205B] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-center text-white bg-[#FF5E00] rounded-xl hover:bg-[#e65100] transition-all"
              >
                Daftar Sekarang
              </Link>
            </div>

            {/* App Info */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                © 2026 PT KAI Services
              </p>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
