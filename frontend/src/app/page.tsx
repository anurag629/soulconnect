import Link from 'next/link'
import Image from 'next/image'
import { Heart, Shield, Users, Star, CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" fill="currentColor" />
              <span className="text-2xl font-serif font-bold text-gray-900">
                Soul<span className="text-primary-600">Connect</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-primary-600 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition">
                How it Works
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
                Pricing
              </Link>
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Star className="h-4 w-4 mr-2" />
                Trusted by 50,000+ families
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                Find Your{' '}
                <span className="gradient-text">Perfect</span>
                <br />
                Life Partner
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                India's most trusted matrimonial platform where families come together 
                to find meaningful, lifelong connections. Safe, elegant, and marriage-oriented.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register" className="btn-primary text-lg px-8 py-4">
                  Create Free Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#how-it-works" className="btn-outline text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-500">Verified Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-500">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8★</div>
                  <div className="text-sm text-gray-500">User Rating</div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[600px]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200 rounded-3xl transform rotate-6"></div>
                <div className="absolute top-10 right-10 w-80 h-80 bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
                    <Heart className="h-32 w-32 text-primary-400" />
                  </div>
                </div>
                <div className="absolute bottom-20 left-0 card p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Profile Verified</div>
                      <div className="text-sm text-gray-500">100% authentic profiles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">Why Choose SoulConnect?</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              We understand the importance of finding the right life partner. 
              Our platform is designed with safety, trust, and meaningful connections in mind.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Profiles</h3>
              <p className="text-gray-600">
                Every profile is manually verified with government ID to ensure authenticity and safety.
              </p>
            </div>
            
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600">
                Our intelligent algorithm matches you with compatible profiles based on your preferences.
              </p>
            </div>
            
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Family-Friendly</h3>
              <p className="text-gray-600">
                A safe, respectful platform designed for serious matrimonial connections, not casual dating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">How It Works</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Finding your perfect match is easy with SoulConnect. 
              Follow these simple steps to begin your journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign up and create your detailed profile with photos and preferences.' },
              { step: '02', title: 'Get Verified', desc: 'Upload your ID for verification to earn a trusted badge.' },
              { step: '03', title: 'Browse Matches', desc: 'Discover compatible profiles using our smart filters.' },
              { step: '04', title: 'Connect & Chat', desc: 'Express interest and start meaningful conversations.' },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="text-6xl font-bold text-primary-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="h-6 w-6 text-primary-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">Choose Your Plan</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Start free and upgrade when you're ready for more features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card p-8">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-500">/forever</span>
              </div>
              <ul className="mt-6 space-y-4">
                {['Create profile', 'Browse profiles', 'Send 5 interests/day', 'Basic filters'].map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block w-full btn-outline text-center">
                Get Started
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="rounded-2xl border-2 border-primary-500 overflow-hidden shadow-xl">
              <div className="bg-primary-600 text-white text-sm font-medium px-4 py-2 text-center">
                ✨ Most Popular
              </div>
              <div className="bg-white p-8">
                <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₹1,999</span>
                  <span className="text-gray-500">/3 months</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {[
                    'Everything in Free',
                    'Unlimited chats',
                    'See who viewed you',
                    'Profile boost',
                    'Contact access',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8 block w-full btn-primary text-center">
                  Get Premium
                </Link>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="card p-8">
              <h3 className="text-lg font-semibold text-gray-900">Elite</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">₹4,999</span>
                <span className="text-gray-500">/6 months</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  'Everything in Premium',
                  'Verified badge',
                  'Priority support',
                  'Relationship manager',
                  'Profile highlighting',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-secondary-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 block w-full btn-secondary text-center">
                Get Elite
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
            Your Perfect Match is Waiting
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of happy couples who found their life partner on SoulConnect. 
            Start your journey today.
          </p>
          <Link href="/register" className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition">
            Create Free Profile
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-primary-500" fill="currentColor" />
                <span className="text-2xl font-serif font-bold text-white">
                  SoulConnect
                </span>
              </div>
              <p className="text-sm">
                India's trusted matrimonial platform for serious, 
                meaningful connections.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-white transition">Safety Tips</Link></li>
                <li><Link href="/faq" className="hover:text-white transition">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white transition">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} SoulConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
