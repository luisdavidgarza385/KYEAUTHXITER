"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SellerSidebar } from "@/components/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === "/seller/login") {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    try {
      const res = await fetch("/api/seller/me");
      const data = await res.json();

      if (data.success) {
        setSeller(data.data);
      } else {
        router.push("/seller/login");
      }
    } catch (error) {
      router.push("/seller/login");
    } finally {
      setLoading(false);
    }
  }

  // Show loading on protected routes
  if (loading && pathname !== "/seller/login") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // Login page - no sidebar
  if (pathname === "/seller/login") {
    return children;
  }

  // Protected routes - with sidebar
  if (!seller) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#020503]">
      <SellerSidebar username={seller.username} />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
