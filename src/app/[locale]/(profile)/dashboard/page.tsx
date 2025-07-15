"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
//import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  DollarSign,
  CheckCircle,
  Plus,
  Search,
  User,
  Settings,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  //const t = await getTranslations("dashboard");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signedUp")) {
      toast.success("Signed up successfully! Welcome to your dashboard.");
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your dashboard!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Offered
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Requested
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Feature coming soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Offer Service
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Request Service
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Edit Settings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Feature coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Service completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-sm text-muted-foreground">$25.00</div>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New request</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Housekeeping
                </div>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
                <div className="text-sm text-muted-foreground">$50.00</div>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Feature coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Coming soon
          </CardTitle>
          <CardDescription>Feature coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Service Management</h4>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage your service offerings with detailed
                descriptions, pricing, and availability.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Booking System</h4>
              <p className="text-sm text-muted-foreground">
                Accept and manage service requests with an integrated calendar
                and scheduling system.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Payment Processing</h4>
              <p className="text-sm text-muted-foreground">
                Secure payment processing with automatic invoicing and
                transaction history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
