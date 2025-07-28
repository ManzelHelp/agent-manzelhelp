"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  Clock,
  MapPin,
} from "lucide-react";

// Hardcoded service categories and services based on database
const serviceCategories = [
  {
    id: 1,
    name: "Cleaning",
    icon: "🧹",
    description: "Professional cleaning services for your home and office",
    color: "from-blue-500 to-blue-600",
    services: [
      {
        id: 1,
        name: "House Cleaning",
        description: "Complete home cleaning service",
      },
      {
        id: 2,
        name: "Office Cleaning",
        description: "Professional office maintenance",
      },
      {
        id: 3,
        name: "Deep Cleaning",
        description: "Thorough deep cleaning service",
      },
      {
        id: 4,
        name: "Window Cleaning",
        description: "Crystal clear window cleaning",
      },
      {
        id: 5,
        name: "Carpet Cleaning",
        description: "Professional carpet care",
      },
      {
        id: 6,
        name: "Post-Construction",
        description: "Clean up after renovations",
      },
    ],
  },
  {
    id: 2,
    name: "Handyman",
    icon: "🔧",
    description: "Skilled professionals for all your home repairs",
    color: "from-orange-500 to-orange-600",
    services: [
      {
        id: 7,
        name: "Furniture Assembly",
        description: "Professional furniture setup",
      },
      {
        id: 8,
        name: "Painting",
        description: "Interior and exterior painting",
      },
      { id: 9, name: "Wall Mounting", description: "Secure mounting services" },
      {
        id: 10,
        name: "Door & Window Repair",
        description: "Fix and maintain doors/windows",
      },
      {
        id: 11,
        name: "Shelving Installation",
        description: "Custom shelf installation",
      },
      { id: 12, name: "Minor Repairs", description: "Quick fix solutions" },
    ],
  },
  {
    id: 3,
    name: "Plumbing",
    icon: "🚰",
    description: "Expert plumbing services and repairs",
    color: "from-cyan-500 to-cyan-600",
    services: [
      { id: 13, name: "Leak Repair", description: "Fix water leaks quickly" },
      {
        id: 14,
        name: "Toilet Repair",
        description: "Toilet maintenance and repair",
      },
      {
        id: 15,
        name: "Drain Cleaning",
        description: "Unclog and clean drains",
      },
      {
        id: 16,
        name: "Faucet Installation",
        description: "New faucet installation",
      },
      {
        id: 17,
        name: "Water Heater Repair",
        description: "Hot water system repair",
      },
      {
        id: 18,
        name: "Pipe Installation",
        description: "Professional pipe work",
      },
    ],
  },
  {
    id: 4,
    name: "Electrical",
    icon: "⚡",
    description: "Certified electrical work and installations",
    color: "from-yellow-500 to-yellow-600",
    services: [
      {
        id: 19,
        name: "Light Installation",
        description: "Professional lighting setup",
      },
      {
        id: 20,
        name: "Socket Installation",
        description: "Electrical outlet installation",
      },
      {
        id: 21,
        name: "Electrical Troubleshooting",
        description: "Diagnose and fix issues",
      },
      {
        id: 22,
        name: "Ceiling Fan Installation",
        description: "Fan installation service",
      },
      {
        id: 23,
        name: "Circuit Breaker Repair",
        description: "Electrical panel repair",
      },
      {
        id: 24,
        name: "Wiring Installation",
        description: "New electrical wiring",
      },
    ],
  },
  {
    id: 5,
    name: "Gardening",
    icon: "🌱",
    description: "Beautiful gardens and landscaping services",
    color: "from-green-500 to-green-600",
    services: [
      { id: 25, name: "Lawn Mowing", description: "Regular lawn maintenance" },
      {
        id: 26,
        name: "Garden Maintenance",
        description: "Complete garden care",
      },
      { id: 27, name: "Tree Trimming", description: "Professional tree care" },
      { id: 28, name: "Planting", description: "New plant installation" },
      { id: 29, name: "Weeding", description: "Garden weed control" },
      {
        id: 30,
        name: "Irrigation Setup",
        description: "Automatic watering systems",
      },
    ],
  },
  {
    id: 6,
    name: "Moving",
    icon: "📦",
    description: "Reliable moving and relocation services",
    color: "from-purple-500 to-purple-600",
    services: [
      { id: 31, name: "Home Moving", description: "Complete home relocation" },
      {
        id: 32,
        name: "Office Moving",
        description: "Business relocation services",
      },
      {
        id: 33,
        name: "Packing Services",
        description: "Professional packing help",
      },
      {
        id: 34,
        name: "Furniture Moving",
        description: "Furniture transport service",
      },
      {
        id: 35,
        name: "Storage Services",
        description: "Secure storage solutions",
      },
    ],
  },
  {
    id: 7,
    name: "Delivery",
    icon: "🚚",
    description: "Fast and reliable delivery services",
    color: "from-red-500 to-red-600",
    services: [
      {
        id: 36,
        name: "Food Delivery",
        description: "Restaurant food delivery",
      },
      {
        id: 37,
        name: "Package Delivery",
        description: "Secure package transport",
      },
      {
        id: 38,
        name: "Grocery Delivery",
        description: "Fresh grocery delivery",
      },
      {
        id: 39,
        name: "Pharmacy Delivery",
        description: "Medical supply delivery",
      },
      {
        id: 40,
        name: "Document Delivery",
        description: "Important document transport",
      },
    ],
  },
  {
    id: 8,
    name: "Beauty & Wellness",
    icon: "💄",
    description: "Professional beauty and wellness services",
    color: "from-pink-500 to-pink-600",
    services: [
      {
        id: 41,
        name: "Home Hairdressing",
        description: "Professional hair styling",
      },
      { id: 42, name: "Manicure/Pedicure", description: "Nail care services" },
      {
        id: 43,
        name: "Massage Therapy",
        description: "Relaxing massage sessions",
      },
      {
        id: 44,
        name: "Makeup Services",
        description: "Professional makeup application",
      },
      { id: 45, name: "Facial Treatment", description: "Skin care treatments" },
    ],
  },
  {
    id: 9,
    name: "Tutoring",
    icon: "📚",
    description: "Expert educational support and tutoring",
    color: "from-indigo-500 to-indigo-600",
    services: [
      { id: 46, name: "Math Tutoring", description: "Mathematics support" },
      {
        id: 47,
        name: "Language Tutoring",
        description: "Language learning support",
      },
      { id: 48, name: "Science Tutoring", description: "Science subject help" },
      {
        id: 49,
        name: "Computer Skills",
        description: "Digital literacy training",
      },
      {
        id: 50,
        name: "Music Lessons",
        description: "Musical instrument lessons",
      },
    ],
  },
  {
    id: 10,
    name: "IT & Tech",
    icon: "💻",
    description: "Professional IT and technology services",
    color: "from-gray-500 to-gray-600",
    services: [
      { id: 51, name: "Computer Repair", description: "PC and laptop repair" },
      {
        id: 52,
        name: "Software Installation",
        description: "Software setup and installation",
      },
      {
        id: 53,
        name: "Network Setup",
        description: "WiFi and network configuration",
      },
      { id: 54, name: "Data Recovery", description: "Data retrieval services" },
      { id: 55, name: "Phone Repair", description: "Mobile device repair" },
    ],
  },
  {
    id: 11,
    name: "Automotive",
    icon: "🚗",
    description: "Professional automotive services",
    color: "from-blue-600 to-blue-700",
    services: [
      { id: 56, name: "Car Washing", description: "Professional car cleaning" },
      { id: 57, name: "Oil Change", description: "Engine oil replacement" },
      { id: 58, name: "Tire Change", description: "Tire replacement service" },
      {
        id: 59,
        name: "Battery Replacement",
        description: "Car battery service",
      },
      { id: 60, name: "Car Detailing", description: "Comprehensive car care" },
    ],
  },
  {
    id: 12,
    name: "Pet Care",
    icon: "🐾",
    description: "Loving care for your beloved pets",
    color: "from-amber-500 to-amber-600",
    services: [
      { id: 61, name: "Pet Walking", description: "Regular pet exercise" },
      {
        id: 62,
        name: "Pet Sitting",
        description: "Pet care while you're away",
      },
      {
        id: 63,
        name: "Pet Grooming",
        description: "Professional pet grooming",
      },
      { id: 64, name: "Pet Training", description: "Behavioral training" },
    ],
  },
  {
    id: 13,
    name: "Event Services",
    icon: "🎉",
    description: "Make your events unforgettable",
    color: "from-rose-500 to-rose-600",
    services: [
      {
        id: 65,
        name: "Event Planning",
        description: "Complete event coordination",
      },
      {
        id: 66,
        name: "Catering Services",
        description: "Professional catering",
      },
      {
        id: 67,
        name: "Photography",
        description: "Event photography services",
      },
      {
        id: 68,
        name: "DJ Services",
        description: "Professional DJ entertainment",
      },
      { id: 69, name: "Decoration", description: "Event decoration services" },
    ],
  },
];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState(
    serviceCategories[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = serviceCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.services.some((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-[var(--color-accent-light)] max-w-3xl mx-auto">
              Discover professional services tailored to your needs. From home
              maintenance to personal care, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative bg-[var(--color-surface)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              Service Categories
            </h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors mobile-button"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors mobile-button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide smooth-scroll pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 w-64 sm:w-72 cursor-pointer transition-all duration-300 mobile-button ${
                  selectedCategory.id === category.id
                    ? "scale-105 shadow-xl"
                    : "hover:scale-102"
                }`}
              >
                <div
                  className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white h-full flex flex-col justify-between`}
                >
                  <div>
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm opacity-75">
                      {category.services.length} services
                    </span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              {selectedCategory.name} Services
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Professional {selectedCategory.name.toLowerCase()} services
              delivered by verified experts in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedCategory.services.map((service) => (
              <div
                key={service.id}
                className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 cursor-pointer group mobile-button"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-lg flex items-center justify-center text-white text-xl">
                    {selectedCategory.icon}
                  </div>
                  <div className="flex items-center gap-1 text-[var(--color-secondary)]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                  {service.name}
                </h3>

                <p className="text-[var(--color-text-secondary)] text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Clock className="w-4 h-4" />
                    <span>2-4 hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <MapPin className="w-4 h-4" />
                    <span>Local</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-[var(--color-accent-light)]">
            Connect with verified professionals in your area and get the job
            done right.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[var(--color-secondary)] text-white rounded-full font-semibold hover:bg-[var(--color-secondary-light)] transition-colors mobile-button">
              Find a Helper
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors mobile-button">
              Become a Helper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
