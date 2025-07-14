import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ServiceSearchBar() {
  return (
    <div className="w-full max-w-md mx-auto mb-10 flex items-center gap-2">
      <Input
        placeholder="Search services..."
        className="h-12 text-lg px-5 flex-1"
      />
      <Button type="submit" size="lg" className="h-12 px-4">
        <Search className="size-5" />
      </Button>
    </div>
  );
}
