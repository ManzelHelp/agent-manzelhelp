"use client";

import { logOutAction } from "@/actions/auth";
import { useRouter } from "@/i18n/navigation";

export default function LogoutButton({ locale }: { locale: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logOutAction();
    router.push(`/${locale}/login`);
  };

  return (
    <button
      onClick={handleLogout}
      className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Se déconnecter
    </button>
  );
}

