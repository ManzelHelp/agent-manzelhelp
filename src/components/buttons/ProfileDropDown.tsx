"use client";

import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
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
import type { User } from "@supabase/supabase-js";

type props = {
  user: User;
};

function ProfileDropDown({ user }: props) {
  const userRole = "customer"; // Default or derive from user metadata if available
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
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel>{userRole}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href={
              userRole === "customer"
                ? "/customer/dashboard"
                : "/tasker/dashboard"
            }
            className="flex items-center"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>user-name</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={
              userRole === "customer"
                ? "/customer/dashboard/settings"
                : "/tasker/dashboard/settings"
            }
            className="flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <div className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <LogOutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropDown;
