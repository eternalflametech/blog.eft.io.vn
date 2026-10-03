// Logic: Executive Floating Pill Navbar with sliding capsule switch, glassmorphism, and animated mobile drawer (adopted from eft.io.vn).
// Input: Active path and scroll position.
// Output: Interactive tactile navigation header.

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Lock, Rss, Sparkles } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Bài viết', href: '/#articles' },
  { label: 'Cổng EFT', href: 'https://eft.io.vn', isExternal: true },
  { label: 'RSS', href: '/feed.xml', isExternal: true },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinksRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLLIElement>(null);

  // 1. Scroll glassmorphism detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Sliding Capsule Indicator pill positioning
  const updateIndicatorPosition = (targetEl: HTMLElement | null) => {
    const navLinks = navLinksRef.current;
    const indicator = indicatorRef.current;
    if (!navLinks || !indicator || window.innerWidth < 1024) {
      if (indicator) indicator.style.opacity = '0';
      return;
    }

    if (!targetEl) {
      indicator.style.opacity = '0';
      return;
    }

    const containerRect = navLinks.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const width = targetRect.width;

    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.opacity = '1';
  };

  const updateToActiveLink = () => {
    if (!navLinksRef.current) return;
    const activeLink = navLinksRef.current.querySelector<HTMLElement>('a.active');
    updateIndicatorPosition(activeLink);
  };

  useEffect(() => {
    const timer = setTimeout(updateToActiveLink, 80);
    window.addEventListener('resize', updateToActiveLink, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateToActiveLink);
    };
  }, [pathname]);

  // 3. Body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.classList.add('overflow-hidden', 'touch-none');
    } else {
      document.body.classList.remove('overflow-hidden', 'touch-none');
    }
    return () => {
      document.body.classList.remove('overflow-hidden', 'touch-none');
    };
  }, [isMobileOpen]);

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 relative">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 no-underline shrink-0 group">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-lg border border-white/15 shadow-md group-hover:border-violet-500/50 transition-colors">
              <Image
                src="/logo.png"
                alt="Logo CLB AI & Robotics Eternal Flame Tech"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base text-white leading-tight tracking-tight whitespace-nowrap group-hover:text-violet-300 transition-colors">
                ETERNAL FLAME TECH
              </span>
              <span className="hidden sm:block text-[11px] text-zinc-400 font-medium uppercase tracking-wider whitespace-nowrap">
                THPT Chuyên Nguyễn Thị Minh Khai
              </span>
            </div>
          </Link>

          {/* Center: Sliding Capsule Switch Navigation */}
          <nav className={`nav-menu ${isMobileOpen ? 'active' : ''}`} id="navMenu">
            <ul
              ref={navLinksRef}
              className="nav-links"
              id="navLinks"
              onMouseLeave={updateToActiveLink}
            >
              {/* Sliding glassmorphic indicator pill */}
              <li
                ref={indicatorRef}
                className="nav-indicator"
                id="navIndicator"
                aria-hidden="true"
              />

              {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className="w-full lg:w-auto">
                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={(e) => updateIndicatorPosition(e.currentTarget)}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between lg:justify-center gap-1.5"
                      >
                        <span>{item.label}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={isActive ? 'active' : ''}
                        onMouseEnter={(e) => updateIndicatorPosition(e.currentTarget)}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Mobile Drawer Quick CTA */}
            <div className="mobile-menu-cta">
              <Link
                href="/admin/posts"
                onClick={() => setIsMobileOpen(false)}
                className="btn-primary-gradient w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Khu Vực Quản Trị</span>
              </Link>
            </div>
          </nav>

          {/* Right Action: Desktop Admin CTA & Mobile Hamburger Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/posts"
              className="nav-cta-btn btn-primary-gradient items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md shadow-violet-600/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Quản trị</span>
            </Link>

            {/* Animated Hamburger Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`mobile-toggle ${isMobileOpen ? 'active' : ''}`}
              id="mobileToggle"
              aria-label="Mở menu điều hướng"
              aria-expanded={isMobileOpen}
            >
              <span className="hamburger-line line-1" />
              <span className="hamburger-line line-2" />
              <span className="hamburger-line line-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu */}
      <div
        className={`nav-overlay ${isMobileOpen ? 'active' : ''}`}
        id="navOverlay"
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}
