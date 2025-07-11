"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function LogOutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogOut = async () => {
    setLoading(true);

    toast("Logged out successfully");

    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogOut}
      disabled={loading}
      className="w-24"
    >
      {loading ? <Loader2 className="animate-spin" /> : "Log Out"}
    </Button>
  );
}

export default LogOutButton;
