import type React from "react"
import { useState } from "react"
import { BusinessGrid } from "../components/business/BusinessGrid"
import { CategoryFilter } from "../components/business/CategoryFilter"
import { SearchBar } from "../components/common/SearchBar"
import { Header } from "../components/common/Header"
import { Footer } from "../components/common/Footer"
import { LoadingSpinner } from "../components/common/LoadingSpinner"
import { useBusinesses } from "../hooks/useBusinesses"
import { useCategories } from "../hooks/useCategories"

export const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { businesses, isLoading: businessesLoading, error: businessesError } = useBusinesses()
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  const filteredBusinesses = businesses.filter((business) => {
    // For MVP, skip category filtering since VendorProfile doesn't have categories yet
    const matchesCategory = true; // Skip category filtering for now
    const matchesSearch =
      !searchTerm ||
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && business.isActive
  })



  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />

      <section className="relative bg-gradient-hero overflow-hidden py-28 lg:py-36">
        <div className="absolute inset-0 bg-[url('/abstract-campus-pattern.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-400/15 via-transparent to-primary/10"></div>
        <div className="container relative mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-10 leading-[0.9] tracking-tight">
              Your Campus
              <span className="text-transparent bg-gradient-to-r from-ucsp-green-500 via-ucsp-green-400 to-ucsp-green-500 bg-clip-text block mt-2">
                Service Hub
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
              Discover trusted local businesses and services tailored for your campus community
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <button className="group bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-strong hover:shadow-glow transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
                <span className="relative z-10">Explore Services</span>
                <div className="absolute inset-0 bg-gradient-to-r from-ucsp-green-400 to-ucsp-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group border-3 border-ucsp-green-500 text-ucsp-green-600 hover:bg-ucsp-green-500 hover:text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 backdrop-blur-sm hover:shadow-strong transform hover:-translate-y-1">
                Join as Business
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-background via-ucsp-green-50/30 to-background border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">Find What You Need</h2>
            <p className="text-muted-foreground mb-16 text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
              Search through hundreds of verified campus-friendly businesses
            </p>
            <div className="relative max-w-3xl mx-auto">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search for businesses, services, or products..."
                className="w-full text-xl py-6 px-10 rounded-3xl border-2 border-border hover:border-ucsp-green-400 focus:border-ucsp-green-500 shadow-medium focus:shadow-strong transition-all duration-300 bg-background/90 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-24">
        <div className="mb-28">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 tracking-tight">Browse by Category</h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Discover services organized by what matters most to students
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-6 text-xl font-medium">Loading categories...</p>
              </div>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-20 bg-gradient-card rounded-3xl border border-border shadow-medium">
              <div className="max-w-md mx-auto">
                <p className="text-destructive mb-10 text-xl font-medium">{categoriesError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-medium hover:shadow-strong transform hover:-translate-y-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-background via-ucsp-green-50/20 to-background rounded-3xl p-12 border border-border shadow-medium hover:shadow-strong transition-all duration-300">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-20 gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                {selectedCategory
                  ? `${categories.find((c) => c.id === selectedCategory)?.name || "Category"} Businesses`
                  : "Featured Businesses"}
              </h2>
              <p className="text-muted-foreground text-xl lg:text-2xl">Trusted by students across campus</p>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-r from-ucsp-green-500/10 to-ucsp-green-400/10 px-8 py-4 rounded-2xl border border-ucsp-green-500/20 shadow-soft">
              <div className="w-4 h-4 bg-ucsp-green-500 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-ucsp-green-600 font-bold text-xl">
                {filteredBusinesses.length} businesses found
              </span>
            </div>
          </div>

          {businessesLoading && businesses.length === 0 ? (
            <div className="flex justify-center py-28">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-8 text-2xl font-medium">Loading amazing businesses...</p>
              </div>
            </div>
          ) : businessesError ? (
            <div className="text-center py-28 bg-gradient-card rounded-3xl border border-border shadow-medium">
              <div className="max-w-md mx-auto">
                <p className="text-destructive mb-10 text-xl font-medium">{businessesError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-ucsp-green-500 hover:bg-ucsp-green-600 text-white px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-medium hover:shadow-strong transform hover:-translate-y-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              <BusinessGrid businesses={filteredBusinesses} categories={categories} loading={businessesLoading} />

              {filteredBusinesses.length > 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-ucsp-green-500/5 via-primary/5 to-ucsp-green-400/5 rounded-3xl border border-border shadow-medium hover:shadow-strong transition-all duration-300">
                  <h3 className="text-4xl font-bold text-foreground mb-8 tracking-tight">
                    Don't see what you're looking for?
                  </h3>
                  <p className="text-muted-foreground mb-12 text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
                    Help us grow our community by suggesting new businesses
                  </p>
                  <button className="group bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-5 rounded-2xl font-bold transition-all duration-300 shadow-medium hover:shadow-strong transform hover:-translate-y-2 hover:scale-105">
                    <span className="group-hover:scale-110 transition-transform duration-300 inline-block">
                      Suggest a Business
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}