"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";
import { ContactSupportDialog } from "../ContactSupportDialog";
import { useRouter } from "@/i18n/navigation";
import { logOutAction } from "@/actions/auth";
import { toast } from "sonner";

function ProfileDropDown() {
  const { user, setUser } = useUserStore();
  const t = useTranslations("Header");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogOut = async () => {
    setIsLoggingOut(true);

    // Clear store and localStorage IMMEDIATELY before logout action
    // This ensures UI updates immediately
    if (typeof window !== "undefined") {
      setUser(null);
      localStorage.removeItem("user-storage");
    } else {
      setUser(null);
    }

    const { errorMessage } = await logOutAction();
    if (!errorMessage) {
      toast(tAuth("logoutSuccess"));
      // Force a full page reload to ensure all cookies are cleared and state is reset
      // Using window.location.href ensures complete page reload and cookie cleanup
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.replace("/");
      }
    } else {
      toast.error(errorMessage);
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <UserIcon className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel>{user?.role ? t(user.role as "tasker" | "customer") : ""}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/${user?.role}/profile`} className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={user?.role ? `/${user.role}/dashboard` : "/customer/dashboard"}
            className="flex items-center"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t("dashboard")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${user?.role}/notifications` || "/customer/notifications"}
            className="flex items-center"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>{t("notifications")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${user?.role}/settings` || "/customer/settings"}
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("settings")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowContactDialog(true)}
          className="flex items-center cursor-pointer"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>{t("contactSupport")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogOut}
          disabled={isLoggingOut}
          className="flex items-center cursor-pointer w-full"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
          ) : (
            <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
          )}
          <span className="flex-1 text-left">{tAuth("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      <ContactSupportDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
      />
    </DropdownMenu>
  );
}

export default ProfileDropDown;
