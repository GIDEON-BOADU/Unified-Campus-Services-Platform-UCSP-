import type React from "react"
import { Link } from "react-router-dom"
import { 
  ArrowRight, 
  Shield, 
  Users, 
  Zap, 
  Star, 
  CheckCircle,
  TrendingUp,
  Clock
} from "lucide-react"
import { Header } from "../components/common/Header"
import { Footer } from "../components/common/Footer"
import { serviceCategories } from "../data/serviceCategories"

export const HomePage: React.FC = () => {



  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-ucsp-green-500/10 via-transparent to-blue-500/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-ucsp-green-400/20 to-ucsp-green-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        <div className="container relative mx-auto px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Enhanced Badge */}
                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-ucsp-green-700 px-6 py-3 rounded-full text-sm font-semibold shadow-lg border border-ucsp-green-200">
                  <div className="w-2 h-2 bg-ucsp-green-500 rounded-full animate-pulse"></div>
                  <Shield className="w-4 h-4" />
                  Trusted by 500+ Campus Students
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                </div>

                {/* Enhanced Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                    Your Campus
                    <span className="block text-transparent bg-gradient-to-r from-ucsp-green-600 via-ucsp-green-500 to-blue-600 bg-clip-text">
                      Service Hub
                    </span>
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-ucsp-green-500 to-blue-500 rounded-full mx-auto lg:mx-0"></div>
                </div>

                {/* Enhanced Subtitle */}
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Connect with <span className="font-semibold text-ucsp-green-600">verified local businesses</span> and 
                  get everything you need delivered right to your campus doorstep.
                </p>

                {/* Enhanced Key Benefits */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-ucsp-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-ucsp-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Verified</div>
                      <div className="text-xs text-gray-600">Vendors Only</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Fast</div>
                      <div className="text-xs text-gray-600">Delivery</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Best</div>
                      <div className="text-xs text-gray-600">Prices</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Campus</div>
                      <div className="text-xs text-gray-600">Community</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    to="/signup" 
                    className="group bg-gradient-to-r from-ucsp-green-500 to-ucsp-green-600 hover:from-ucsp-green-600 hover:to-ucsp-green-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <span>Start Exploring</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link 
                    to="/signup" 
                    className="group border-2 border-ucsp-green-500 text-ucsp-green-600 hover:bg-ucsp-green-500 hover:text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 backdrop-blur-sm hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Become a Vendor</span>
                  </Link>
                </div>

                {/* Enhanced Social Proof Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">50+</div>
                    <div className="text-xs text-gray-600 font-medium">Verified Vendors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">500+</div>
                    <div className="text-xs text-gray-600 font-medium">Happy Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">1000+</div>
                    <div className="text-xs text-gray-600 font-medium">Orders Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                    <div className="text-xs text-gray-600 font-medium">Average Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Elements */}
              <div className="hidden lg:block relative">
                <div className="relative z-10">
                  {/* Service Categories Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    {serviceCategories.slice(0, 4).map((category, index) => (
                      <div 
                        key={category.id}
                        className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Category Image */}
                        <div className="relative w-full h-24 mb-4 rounded-xl overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className={`absolute top-2 right-2 w-8 h-8 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-sm">{category.icon}</span>
                          </div>
                        </div>
                        
                        {/* Category Info */}
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {category.description}
                        </p>
                        
                        {/* Services List */}
                        <div className="flex flex-wrap gap-1">
                          {category.services.slice(0, 3).map((service, serviceIndex) => (
                            <span 
                              key={serviceIndex}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {category.services.length > 3 && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                              +{category.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-ucsp-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer />
    </div>
  )
}