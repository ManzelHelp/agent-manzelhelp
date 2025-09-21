import { getTranslations } from "next-intl/server";

export default async function WaitForConfirmation() {
  const t = await getTranslations("auth");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <svg
          className="w-16 h-16 text-blue-500 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {t("pages.waitForConfirmation.title")}
        </h1>
        <p className="text-gray-600 text-center">
          {t("pages.waitForConfirmation.description")}
        </p>
      </div>
    </div>
  );
}
