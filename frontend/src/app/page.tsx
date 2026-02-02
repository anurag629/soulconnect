import Link from 'next/link'
import { Heart, Shield, Users, Sparkles, UserPlus, Search, MessageCircle, Lock, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Navigation - responsive */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 safe-area-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-1.5 active:opacity-70 hover:opacity-80 transition">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600" fill="currentColor" />
              <span className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                KSHATRIYA<span className="text-primary-600">Connect</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 active:bg-primary-50 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - fully responsive */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Find Your <span className="text-primary-600">Perfect</span> Life Partner
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                India's trusted matrimonial platform for meaningful, lifelong connections.
              </p>

              {/* CTAs - stack on mobile, row on tablet+ */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center py-4 px-6 sm:px-8 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 active:bg-primary-700 transition shadow-lg shadow-primary-600/20"
                >
                  Create Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center py-4 px-6 sm:px-8 bg-gray-100 text-gray-700 text-base font-semibold rounded-xl hover:bg-gray-200 active:bg-gray-200 transition"
                >
                  Sign In
                </Link>
              </div>

              {/* Security Badges */}
              <div className="mt-8 sm:mt-10 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Private</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                <div className="w-72 h-72 xl:w-80 xl:h-80 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <Heart className="w-32 h-32 xl:w-40 xl:h-40 text-primary-400" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Verified Profiles</p>
                    <p className="text-xs text-gray-500">100% authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - responsive grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-gray-900 text-center mb-8 sm:mb-12">
            How It Works
          </h2>

          {/* Mobile: Vertical | Tablet+: Horizontal */}
          <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-3 md:gap-8 lg:gap-12 space-y-6 md:space-y-0">
            {/* Step 1 */}
            <div className="flex md:flex-col items-start md:items-center md:text-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1 md:mt-4">
                <div className="flex items-center gap-2 mb-1 md:justify-center">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 sm:text-lg">Create Profile</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">Sign up free and add your details & photos</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex md:flex-col items-start md:items-center md:text-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1 md:mt-4">
                <div className="flex items-center gap-2 mb-1 md:justify-center">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 sm:text-lg">Discover Matches</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">Browse verified profiles that match your preferences</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex md:flex-col items-start md:items-center md:text-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1 md:mt-4">
                <div className="flex items-center gap-2 mb-1 md:justify-center">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900 sm:text-lg">Connect & Chat</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">Express interest and start meaningful conversations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - responsive grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Why Choose Us
          </h2>

          {/* Mobile: Scroll | Tablet+: Grid */}
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:gap-6 lg:gap-8">
            <div className="flex-shrink-0 w-[80vw] sm:w-auto snap-center bg-gray-50 sm:bg-white sm:border sm:border-gray-100 rounded-2xl p-6 sm:p-8 sm:hover:shadow-lg sm:transition-shadow">
              <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-100 flex items-center justify-center sm:mx-auto sm:mb-4">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Verified Profiles</h3>
                  <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Every profile is verified for authenticity and safety</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-[80vw] sm:w-auto snap-center bg-gray-50 sm:bg-white sm:border sm:border-gray-100 rounded-2xl p-6 sm:p-8 sm:hover:shadow-lg sm:transition-shadow">
              <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-100 flex items-center justify-center sm:mx-auto sm:mb-4">
                  <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Smart Matching</h3>
                  <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">AI-powered algorithm finds your best matches</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-[80vw] sm:w-auto snap-center bg-gray-50 sm:bg-white sm:border sm:border-gray-100 rounded-2xl p-6 sm:p-8 sm:hover:shadow-lg sm:transition-shadow">
              <div className="flex items-center gap-4 sm:flex-col sm:text-center sm:gap-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-100 flex items-center justify-center sm:mx-auto sm:mb-4">
                  <Users className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Family-Friendly</h3>
                  <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Safe platform for serious matrimonial connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - responsive */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-primary-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white mb-3 sm:mb-4">
            Ready to Find Your Partner?
          </h2>
          <p className="text-primary-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">
            Join thousands of happy couples. It's free to get started.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-10 py-4 bg-white text-primary-600 font-semibold text-base sm:text-lg rounded-xl hover:bg-gray-100 active:bg-gray-100 transition shadow-lg"
          >
            Create Profile
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer - responsive */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary-600" fill="currentColor" />
            <span className="font-serif font-semibold text-gray-900">KSHATRIYAConnect</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900 active:text-gray-900 transition">Privacy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900 active:text-gray-900 transition">Terms</Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-900 active:text-gray-900 transition">Contact</Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">© {new Date().getFullYear()} KSHATRIYAConnect</p>
        </div>
      </footer>
    </div>
  )
}
