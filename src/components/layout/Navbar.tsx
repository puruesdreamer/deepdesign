"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "首页", enName: "HOME", href: "/" },
  { name: "作品展示", enName: "WORKS", href: "/#works" },
  { name: "关于我们", enName: "ABOUT", href: "/#about" },
  { name: "联系我们", enName: "CONTACT", href: "/#contact" },
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
            <Image 
              src="/images/static/logo.png" 
              alt="FENG YI SPACE Logo" 
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl leading-none font-bold tracking-widest uppercase text-gray-900">
              风翼空间
            </span>
            <span className="text-[0.6rem] md:text-xs leading-none font-medium tracking-[0.2em] uppercase text-gray-500 mt-1">
              FENG YI SPACE
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 ml-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={!isHome && link.href.startsWith("/#") ? "/" + link.href : link.href} 
              className="group flex flex-col items-center justify-center text-center"
            >
              <span className="text-base md:text-[1.2rem] font-bold tracking-widest group-hover:text-gray-500 transition-colors uppercase">
                {link.name}
              </span>
              <span className="text-[0.6rem] font-medium tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors uppercase -mt-1">
                {link.enName}
              </span>
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
                  className="text-base font-medium flex items-center gap-2"
                >
                  <span>{link.name}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{link.enName}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
