"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "首页", href: "/" },
  { name: "作品展示", href: "/#works" },
  { name: "关于我们", href: "/#about" },
  { name: "联系我们", href: "/#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn("fixed top-0 w-full z-40 transition-all duration-300", scrolled ? "bg-white/95 backdrop-blur-sm py-4 shadow-sm" : "bg-white/50 backdrop-blur-sm py-6")}>
      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center max-w-[1920px]">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50 group">
          <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/images/static/logo.png" 
              alt="FENG YI SPACE Logo" 
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-lg md:text-xl leading-none font-bold tracking-widest uppercase text-gray-900">
            风翼空间
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 ml-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={!isHome && link.href.startsWith("/#") ? "/" + link.href : link.href} 
              className="text-base md:text-[1.2rem] font-bold tracking-widest hover:text-gray-500 transition-colors uppercase"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white border-b md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={!isHome && link.href.startsWith("/#") ? "/" + link.href : link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
