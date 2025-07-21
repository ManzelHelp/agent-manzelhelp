"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CustomerOfferPage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Create an Offer
          </CardTitle>
          <CardDescription>
            Fill out the form below to look for a helper in a certain service.
            (Placeholder, no functionality yet)
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="grid gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                name="service"
                placeholder="e.g. Cleaning, Gardening, Moving..."
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Describe what you need help with..."
                disabled
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" disabled />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" type="time" disabled />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter your address or area..."
                disabled
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Submit Offer (Coming Soon)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
