import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  CreditCard,
  Star,
  Sparkles,
  Zap,
  Disc,
  Paintbrush,
  Smartphone,
  ChevronRight,
  Flame,
  AlertTriangle,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const serviceCategories = [
    {
      id: 'regular-service',
      title: 'Regular Service',
      description: 'Comprehensive 40-point inspection & oil change for peak vehicle health.',
      icon: Wrench,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'ac-service',
      title: 'AC Service & Repair',
      description: 'Cooling coil cleaning, filter replacement & gas top-up for fresh cabin air.',
      icon: Sparkles,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      id: 'denting-painting',
      title: 'Denting & Painting',
      description: 'Grade-A paint booth finishing with 100% color match guarantee.',
      icon: Paintbrush,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'battery',
      title: 'Battery Replacement',
      description: 'Instant battery health test, jumpstart & genuine brand replacements.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'tyres',
      title: 'Tyres & Wheel Care',
      description: 'Laser wheel alignment, balancing, rotation and brand-new tyres.',
      icon: Disc,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'detailing',
      title: 'Detailing & Spa',
      description: 'Ceramic coating, deep interior dry-cleaning, Teflon and waxing.',
      icon: Flame,
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Book Online',
      desc: 'Choose your desired service, pick a date & enter your preferred doorstep location.',
      icon: Calendar,
    },
    {
      step: '02',
      title: 'Mechanic Assigned',
      desc: 'A background-verified master technician arrives equipped at your doorstep.',
      icon: MapPin,
    },
    {
      step: '03',
      title: 'Service Executed',
      desc: 'Transparent diagnostics & genuine spare parts fitted right before your eyes.',
      icon: CheckCircle2,
    },
    {
      step: '04',
      title: 'Pay & Relax',
      desc: 'Digital invoice with zero hidden charges and a 30-day workmanship warranty.',
      icon: CreditCard,
    },
  ];

  const whyChooseUs = [
    {
      title: 'Certified Mechanics',
      description: 'Rigorous 5-step background checked and brand-trained certified technicians.',
      icon: ShieldCheck,
    },
    {
      title: 'Doorstep Service',
      description: 'Convenient servicing at your home or workplace without disrupting your day.',
      icon: MapPin,
    },
    {
      title: 'Transparent Pricing',
      description: 'Fixed upfront quotes with itemized labor and part costs. No surprise add-ons.',
      icon: CreditCard,
    },
    {
      title: 'Genuine Parts',
      description: '100% OEM/OES guaranteed authentic parts straight from authorized distributors.',
      icon: Wrench,
    },
    {
      title: 'Real-time Tracking',
      description: 'Live technician arrival tracking and step-by-step digital status reports on app.',
      icon: Clock,
    },
    {
      title: '30-Day Warranty',
      description: 'Peace of mind with 30 days or 1,000 km unconditional service warranty.',
      icon: Star,
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Sharma',
      city: 'Bangalore',
      rating: 5,
      car: 'Honda City 2021',
      comment:
        'The doorstep service was prompt and extremely professional. The technician explained every single part replaced and tested the car thoroughly. Highly recommended!',
    },
    {
      name: 'Priya Iyer',
      city: 'Mumbai',
      rating: 5,
      car: 'Hyundai Creta 2020',
      comment:
        'Saved my weekend trip! Booked an emergency AC service and battery change in the morning, technician arrived within 45 mins. Truly hassle-free experience.',
    },
    {
      name: 'Vikram Malhotra',
      city: 'Delhi NCR',
      rating: 5,
      car: 'Volkswagen Polo',
      comment:
        'The upfront pricing and transparent digital report won me over. Authorized service centers charged twice as much for the same periodic service.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs sm:text-sm font-semibold border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Trusted by 100,000+ Happy Car Owners Across India
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              Professional Auto Care <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
                at Your Doorstep
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed">
              Experience transparent, dealership-quality car maintenance, emergency repairs, genuine spare parts, and certified used cars without leaving your home.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/services"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                Book Service
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency Help
              </Link>
            </div>
            {/* Quick Metrics */}
            <div className="pt-8 border-t border-gray-800 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">4.8 / 5</div>
                <div className="text-xs text-gray-400">Customer Rating</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-400">Certified Mechanics</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
                <div className="text-xs text-gray-400">Cities Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Our Services</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Tailored Maintenance for Every Need
          </h3>
          <p className="mt-3 text-gray-600 text-base">
            From quick periodic lube services to intricate dent painting and battery solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">{cat.description}</p>
                </div>
                <Link
                  to="/services"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 gap-1 group"
                >
                  Explore Packages
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Smooth Process</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How Auto Pro Works
            </h3>
            <p className="mt-3 text-gray-600">
              Reliable doorstep car service made simple in just four quick steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st) => {
              const StepIcon = st.icon;
              return (
                <div key={st.step} className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-blue-200">{st.step}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{st.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Auto Pro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">The Auto Pro Edge</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Drivers Choose Us
          </h3>
          <p className="mt-3 text-gray-600">
            Engineered around trust, speed, transparent pricing, and verifiable quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Download App Section */}
      <section id="download-app" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 sm:p-12 lg:p-16 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
              Mobile App Experience
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Manage Your Entire Garage in One App
            </h3>
            <p className="text-blue-100 text-base leading-relaxed">
              Track real-time mechanic visits, review live vehicle inspection checklists, download GST invoices, and order verified spare parts with express delivery.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                className="px-5 py-3 rounded-xl bg-black hover:bg-gray-900 text-white flex items-center gap-3 transition shadow-md"
              >
                <Smartphone className="w-6 h-6 text-white" />
                <div className="text-left leading-none">
                  <div className="text-[10px] text-gray-300 uppercase">Download on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </button>
              <button
                type="button"
                className="px-5 py-3 rounded-xl bg-black hover:bg-gray-900 text-white flex items-center gap-3 transition shadow-md"
              >
                <Smartphone className="w-6 h-6 text-white" />
                <div className="text-left leading-none">
                  <div className="text-[10px] text-gray-300 uppercase">Download on</div>
                  <div className="text-sm font-bold">Apple App Store</div>
                </div>
              </button>
            </div>
          </div>
          {/* Mockup Placeholder */}
          <div className="w-64 sm:w-72 h-80 sm:h-96 rounded-3xl bg-gray-900 border-4 border-gray-700 shadow-2xl p-4 flex flex-col justify-between text-center shrink-0">
            <div className="w-20 h-4 bg-gray-800 rounded-full mx-auto" />
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white">
                <Wrench className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Auto Pro Mobile</p>
              <p className="text-xs text-gray-400">Live booking tracking active</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-xl text-left text-xs space-y-1">
              <div className="text-gray-300 font-medium">Mechanic Arriving:</div>
              <div className="text-emerald-400 font-semibold">12 Mins away</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Testimonials</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Loved by Indian Car Owners
          </h3>
          <p className="mt-3 text-gray-600">
            Real feedback from car owners who rely on Auto Pro for their vehicle maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic mb-6">"{t.comment}"</p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.city}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                  {t.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
