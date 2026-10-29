import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search Products | LOKI ZONE Nepal",
  description: "Search table tennis rackets, rubbers, apparel, and competition equipment.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-700">Searching LOKI Catalog...</p>
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
