"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const tabs = [
    { href: "/", label: "Beranda", icon: "fa-solid fa-house" },
    { href: "/search", label: "Cari", icon: "fa-solid fa-magnifying-glass" },
    { href: "/request", label: "Request", icon: "fa-solid fa-clipboard-list" },
    { href: "/owner", label: "Owner", icon: "fa-solid fa-user-astronaut" },
    ...(isAdmin
      ? [{ href: "/dashboard", label: "Panel", icon: "fa-solid fa-gauge" }]
      : [{ href: "/admin/login", label: "Admin", icon: "fa-solid fa-shield-halved" }]),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile Navigation Tab Bar">
      <div className="mobile-tab-bar-inner">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mobile-tab-item ${active ? "is-active" : ""}`}
            >
              <div className="tab-icon-wrap">
                <i className={tab.icon} />
              </div>
              <span className="tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
