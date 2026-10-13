import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Service, ServiceCategory } from '../types';
import { Clock, ShieldCheck, Check, Search, AlertCircle, Loader2 } from 'lucide-react';

const fallbackCategories: ServiceCategory[] = [
  { id: 'all', name: 'All Services', slug: 'all' },
  { id: 'cat-1', name: 'Periodic Services', slug: 'periodic' },
  { id: 'cat-2', name: 'AC & Electrical', slug: 'ac-electrical' },
  { id: 'cat-3', name: 'Brakes & Suspension', slug: 'brakes' },
  { id: 'cat-4', name: 'Detailing & Spa', slug: 'detailing' },
  { id: 'cat-5', name: 'Batteries & Tyres', slug: 'batteries' },
];

const fallbackServices: Service[] = [
  {
    id: 's-1',
    categoryId: 'cat-1',
    name: 'Basic Service Package',
    description: 'Essential oil filter replacement, 15-point diagnostic check, wiper fluid top-up & coolant check.',
    price: 1999,
    discountedPrice: 1599,
    duration: '2 Hours',
    features: ['Engine Oil Top-up / Check', 'Oil Filter Replacement', 'Wiper Fluid Refill', 'Battery Health Check'],
    isPopular: false,
  },
  {
    id: 's-2',
    categoryId: 'cat-1',
    name: 'Standard Periodic Service',
    description: 'Complete 30-point car checkup including synthetic engine oil change, oil filter, air filter cleaning & brake check.',
    price: 3499,
    discountedPrice: 2999,
    duration: '3 Hours',
    features: ['100% Synthetic Oil Change', 'Air Filter Clean / Replace', 'AC Filter Clean', 'All 4 Brakes Cleaning'],
    isPopular: true,
  },
  {
    id: 's-3',
    categoryId: 'cat-1',
    name: 'Comprehensive Super Service',
    description: 'The ultimate car overhaul with 50-point diagnostic inspection, engine flushing, throttle body cleaning & brake pads inspection.',
    price: 5999,
    discountedPrice: 4899,
    duration: '4-5 Hours',
    features: ['Synthetic Oil + Flush', 'Spark Plug Inspection', 'Brake Fluid Bleeding', 'Complete Car Sanitization'],
    isPopular: false,
  },
  {
    id: 's-4',
    categoryId: 'cat-2',
    name: 'Complete AC Service & Gas Top-up',
    description: 'High-pressure evaporator coil cleaning, cabin filter change, refrigerant top-up and condenser cleaning.',
    price: 2499,
    discountedPrice: 1999,
    duration: '2 Hours',
    features: ['Refrigerant Gas Top-Up', 'Cooling Coil De-dusting', 'Cabin Filter Clean/Swap', 'Vent Odor Treatment'],
    isPopular: false,
  },
  {
    id: 's-5',
    categoryId: 'cat-3',
    name: 'Brake Disc & Pad Replacement',
    description: 'Precision inspection of front and rear brakes, brake fluid check, disc resurfacing or pad replacement.',
    price: 1899,
    discountedPrice: 1499,
    duration: '1.5 Hours',
    features: ['Caliper Lubrication', 'Brake Pad Replacement', 'Disc Rotor Truing Check', 'Brake Fluid Bleed'],
    isPopular: false,
  },
  {
    id: 's-6',
    categoryId: 'cat-4',
    name: 'Full Body Ceramic Coating & Spa',
    description: 'Multi-stage paint correction, swirl mark removal, high-gloss 9H ceramic coating and interior deep foam shampooing.',
    price: 8999,
    discountedPrice: 7499,
    duration: '6 Hours',
    features: ['9H Hardness Protection', 'Swirl Marks Correction', 'Interior Deep Shampoo', 'Alloy Wheel Polishing'],
    isPopular: true,
  },
  {
    id: 's-7',
    categoryId: 'cat-5',
    name: 'On-Demand Battery Jumpstart & Replacement',
    description: 'Fast battery diagnostics, alternator charging test, doorstep jumpstart or new battery fitting with old buyback.',
    price: 999,
    discountedPrice: 799,
    duration: '45 Mins',
    features: ['Doorstep Voltage Test', 'Terminal Cleaning & Greasing', 'OEM Warranty Provided', 'Old Battery Buyback Discount'],
    isPopular: false,
  },
];

const ServicesPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>(fallbackCategories);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [catsRes, servsRes] = await Promise.allSettled([
          api.get('/services/categories'),
          api.get('/services'),
        ]);

        if (isMounted) {
          if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value.data?.data)) {
            setCategories([{ id: 'all', name: 'All Services', slug: 'all' }, ...catsRes.value.data.data]);
          } else if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value.data)) {
            setCategories([{ id: 'all', name: 'All Services', slug: 'all' }, ...catsRes.value.data]);
          }

          if (servsRes.status === 'fulfilled' && Array.isArray(servsRes.value.data?.data)) {
            setServices(servsRes.value.data.data);
          } else if (servsRes.status === 'fulfilled' && Array.isArray(servsRes.value.data)) {
            setServices(servsRes.value.data);
          }
        }
      } catch {
        // use fallbacks silently
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = services.filter((srv) => {
    const matchesCategory =
      activeCategory === 'all' || srv.categoryId === activeCategory || (srv.category && srv.category.id === activeCategory);
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Book Doorstep Car Services
          </h1>
          <p className="mt-3 text-gray-600 text-base">
            Transparent pricing, 100% genuine parts, and expert certified mechanics right at your doorstep.
          </p>
        </div>

        {/* Search & Categories Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. oil change, AC, brakes)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state indicator */}
        {loading && (
          <div className="flex items-center justify-center py-6 text-blue-600 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Fetching latest service offerings...</span>
          </div>
        )}

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Services Found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search terms or category selection.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  service.isPopular ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {service.isPopular && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full mb-3 tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Highlights / Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-2 mb-6 pt-2 border-t border-gray-100">
                      {service.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900">
                        ₹{(service.discountedPrice || service.price).toLocaleString()}
                      </span>
                      {service.discountedPrice && (
                        <span className="text-sm line-through text-gray-400">
                          ₹{service.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Takes approx {service.duration}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setBookingSuccessModal(service.name)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 30-Day Guarantee Banner */}
        <div className="mt-14 p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">100% Satisfaction & 30-Day Workmanship Warranty</h4>
              <p className="text-xs text-gray-600">
                Every service booked through Auto Pro is backed by a 30-day or 1,000 km no-questions-asked warranty.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 text-xs font-semibold text-blue-700 hover:underline shrink-0"
          >
            Learn More
          </button>
        </div>

        {/* Booking Confirmation Dialog */}
        {bookingSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Booking Preview</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                You selected <strong className="text-gray-900">{bookingSuccessModal}</strong>. Online booking on this website is under development. No slot has been reserved and no payment has been taken.
              </p>
              <button
                onClick={() => setBookingSuccessModal(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
