import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { UsedCarListing } from '../types';
import {
  Car,
  Fuel,
  Gauge,
  MapPin,
  Eye,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  X,
  PhoneCall,
} from 'lucide-react';

const fallbackCars: UsedCarListing[] = [
  {
    id: 'car-1',
    brand: 'Hyundai',
    model: 'Creta SX (O) Turbo Petrol',
    year: 2022,
    variant: '1.4 Turbo Dual Clutch',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 26000,
    price: 1450000,
    location: 'Bangalore, Indiranagar',
    viewCount: 342,
    ownersCount: 1,
  },
  {
    id: 'car-2',
    brand: 'Honda',
    model: 'City ZX CVT',
    year: 2021,
    variant: '5th Gen 1.5 i-VTEC',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 38000,
    price: 1120000,
    location: 'Mumbai, Andheri West',
    viewCount: 489,
    ownersCount: 1,
  },
  {
    id: 'car-3',
    brand: 'Tata',
    model: 'Nexon EV MAX XZ Plus Lux',
    year: 2023,
    variant: '40.5 kWh Long Range',
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: 18500,
    price: 1380000,
    location: 'Pune, Wakad',
    viewCount: 512,
    ownersCount: 1,
  },
  {
    id: 'car-4',
    brand: 'Maruti Suzuki',
    model: 'Brezza ZXi Plus AT',
    year: 2022,
    variant: 'Smart Hybrid 1.5 K15C',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: 31000,
    price: 990000,
    location: 'Delhi, Rohini',
    viewCount: 280,
    ownersCount: 1,
  },
  {
    id: 'car-5',
    brand: 'Toyota',
    model: 'Innova Crysta 2.4 VX',
    year: 2020,
    variant: '7 Seater Diesel Manual',
    fuelType: 'Diesel',
    transmission: 'Manual',
    mileage: 64000,
    price: 1890000,
    location: 'Hyderabad, Gachibowli',
    viewCount: 710,
    ownersCount: 2,
  },
  {
    id: 'car-6',
    brand: 'Mahindra',
    model: 'XUV700 AX7 AWD Diesel',
    year: 2022,
    variant: '2.2 mHawk Auto',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: 34000,
    price: 2150000,
    location: 'Bangalore, Whitefield',
    viewCount: 620,
    ownersCount: 1,
  },
];

const brandsList = ['All', 'Hyundai', 'Honda', 'Tata', 'Maruti Suzuki', 'Toyota', 'Mahindra'];
const fuelTypesList = ['All', 'Petrol', 'Diesel', 'Electric', 'CNG'];
const yearsList = ['All', '2023', '2022', '2021', '2020'];

const UsedCarsPage: React.FC = () => {
  const [cars, setCars] = useState<UsedCarListing[]>(fallbackCars);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [maxPrice, setMaxPrice] = useState<number>(2500000);
  const [selectedCarForContact, setSelectedCarForContact] = useState<UsedCarListing | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCars = async () => {
      try {
        const res = await api.get('/used-cars');
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setCars(res.data.data);
          } else if (Array.isArray(res.data)) {
            setCars(res.data);
          }
        }
      } catch {
        // use fallbackCars
      }
    };
    fetchCars();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCars = cars.filter((car) => {
    const matchBrand = selectedBrand === 'All' || car.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchFuel = selectedFuel === 'All' || car.fuelType.toLowerCase() === selectedFuel.toLowerCase();
    const matchYear = selectedYear === 'All' || car.year.toString() === selectedYear;
    const matchPrice = car.price <= maxPrice;
    return matchBrand && matchFuel && matchYear && matchPrice;
  });

  const resetFilters = () => {
    setSelectedBrand('All');
    setSelectedFuel('All');
    setSelectedYear('All');
    setMaxPrice(2500000);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Certified Pre-Owned Cars
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            200-point inspected, transparent pricing, verified ownership history with 1-year warranty.
          </p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Filter Listings</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {brandsList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Type Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Fuel Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {fuelTypesList.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFuel(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedFuel === f
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  <span>Max Budget</span>
                  <span className="text-blue-600 font-extrabold text-sm">
                    ₹{(maxPrice / 100000).toFixed(1)} Lakh
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={2500000}
                  step={50000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>₹5L</span>
                  <span>₹25L</span>
                </div>
              </div>

              {/* Inspection Quality Badge */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All vehicles inspected with 200+ quality checkpoints</span>
                </div>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {filteredCars.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Cars Matching Selected Filters</h3>
                <p className="text-sm text-gray-500 mb-4">Try increasing maximum budget or clearing brand filters.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                  >
                    {/* Visual Card Top */}
                    <div className="h-48 bg-gradient-to-br from-slate-800 to-gray-900 relative flex items-center justify-center p-6 text-white">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Car className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {car.year} Model
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-gray-200 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{car.viewCount} views</span>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white font-medium">
                          {car.fuelType}
                        </span>
                        {car.transmission && (
                          <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white font-medium">
                            {car.transmission}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-blue-600 mb-1">{car.brand}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {car.brand} {car.model}
                        </h3>
                        {car.variant && <p className="text-xs text-gray-500 mb-4">{car.variant}</p>}

                        {/* Specs row */}
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-xs text-gray-600 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-gray-400" />
                            <span>{(car.mileage || car.mileageKm || 0).toLocaleString()} km</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel className="w-3.5 h-3.5 text-gray-400" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{car.year}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{car.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <div className="text-[11px] text-gray-400 uppercase font-semibold">Price</div>
                          <div className="text-xl font-black text-gray-900">
                            ₹{(car.price / 100000).toFixed(2)} Lakh
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCarForContact(car)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Contact Seller
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Seller Modal */}
        {selectedCarForContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 relative">
              <button
                onClick={() => setSelectedCarForContact(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Schedule Inspection / Test Drive</h3>
              <p className="text-xs text-gray-500 mb-4">
                Vehicle: {selectedCarForContact.year} {selectedCarForContact.brand} {selectedCarForContact.model} (
                ₹{(selectedCarForContact.price / 100000).toFixed(2)} Lakh)
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Test-drive requests are not connected yet. No request has been sent. Please contact support directly.');
                  setSelectedCarForContact(null);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City / Preferred Hub</label>
                  <input
                    type="text"
                    defaultValue={selectedCarForContact.location}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition mt-2"
                >
                  Confirm & Request Test Drive
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsedCarsPage;
