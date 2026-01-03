"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  Bell,
  HelpCircle,
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
import LogOutButton from "./LogOutButton";
import { useUserStore } from "@/stores/userStore";
import { useTranslations } from "next-intl";
import { ContactSupportDialog } from "../ContactSupportDialog";

function ProfileDropDown() {
  const { user } = useUserStore();
  const t = useTranslations("Header");
  const [showContactDialog, setShowContactDialog] = useState(false);

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

        <DropdownMenuLabel>{user?.role}</DropdownMenuLabel>
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
          <span>Contact Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <LogOutButton />
          </div>
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
