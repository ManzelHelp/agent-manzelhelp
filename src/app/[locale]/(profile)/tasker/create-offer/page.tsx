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

export default function TaskerOfferPage() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-10 flex flex-col items-center justify-center min-h-[70vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Biete einen Service an
          </CardTitle>
          <CardDescription>
            Fülle das Formular aus, um einen Service anzubieten. (Platzhalter,
            noch keine Funktionalität)
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="grid gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                name="service"
                placeholder="z.B. Reinigung, Gartenarbeit, Umzug..."
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input
                id="description"
                name="description"
                placeholder="Beschreibe, welchen Service du anbietest..."
                disabled
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="date">Verfügbar ab</Label>
                <Input id="date" name="date" type="date" disabled />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="time">Uhrzeit</Label>
                <Input id="time" name="time" type="time" disabled />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Einsatzort</Label>
              <Input
                id="location"
                name="location"
                placeholder="Gib deine Adresse oder Region an..."
                disabled
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Service anbieten (Bald verfügbar)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
