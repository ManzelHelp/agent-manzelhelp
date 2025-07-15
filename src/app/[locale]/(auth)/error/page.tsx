import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function ErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="text-destructive mb-2" size={48} />
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>Please try again later.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full mt-4">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
