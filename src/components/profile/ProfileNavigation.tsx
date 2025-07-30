import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, Menu } from "lucide-react";

export type ProfileSection =
  | "personal"
  | "bio"
  | "availability"
  | "addresses"
  | "payment";

interface Section {
  id: ProfileSection;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MissingField {
  id: string;
  label: string;
  section: ProfileSection;
  icon: React.ReactNode;
  description: string;
  required: boolean;
}

interface ProfileNavigationProps {
  sections: Section[];
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  missingFields: MissingField[];
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function ProfileNavigation({
  sections,
  activeSection,
  onSectionChange,
  missingFields,
  mobileMenuOpen,
  onMobileMenuToggle,
}: ProfileNavigationProps) {
  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-color-text-primary">
                Navigation
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onMobileMenuToggle}
                className="border-color-border hover:bg-color-primary/5"
              >
                <Menu className="h-4 w-4 mr-2" />
                {mobileMenuOpen ? "Close" : "Menu"}
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${
                    mobileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
            {mobileMenuOpen && (
              <nav className="space-y-1">
                {sections.map((section) => {
                  const sectionMissingFields = missingFields.filter(
                    (field) => field.section === section.id
                  );
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        onSectionChange(section.id);
                        onMobileMenuToggle();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all duration-200 rounded-lg ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                          : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </div>
                      {sectionMissingFields.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-color-error" />
                          <span className="text-xs font-medium text-color-error">
                            {sectionMissingFields.length}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <Card className="border-0 shadow-lg bg-color-surface/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <nav className="flex space-x-1">
              {sections.map((section) => {
                const sectionMissingFields = missingFields.filter(
                  (field) => field.section === section.id
                );
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-color-primary/10 to-color-secondary/10 text-color-primary border border-color-primary/20 shadow-sm"
                        : "text-color-text-secondary hover:text-color-text-primary hover:bg-color-accent/30"
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                    {sectionMissingFields.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-color-error" />
                        <span className="text-xs font-medium text-color-error">
                          {sectionMissingFields.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
