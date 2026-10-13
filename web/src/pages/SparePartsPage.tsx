import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { SparePart } from '../types';
import { Search, ShoppingBag, CheckCircle, Package, ShieldCheck, Tag } from 'lucide-react';

const fallbackSpareParts: SparePart[] = [
  {
    id: 'part-1',
    name: 'Bosch High-Performance Oil Filter',
    partNumber: 'F002H22025',
    brand: 'Bosch',
    category: 'Filters',
    description: 'High-efficiency media traps 99% of contaminants, designed for synthetic motor oils.',
    price: 499,
    discountedPrice: 389,
    stock: 24,
    inStock: true,
  },
  {
    id: 'part-2',
    name: 'Castrol EDGE 5W-40 Fully Synthetic Engine Oil (4L)',
    partNumber: 'CAS-EDGE-5W40',
    brand: 'Castrol',
    category: 'Engine & Fluids',
    description: 'Fluid TITANIUM technology strengthens oil structure under extreme engine pressures.',
    price: 3200,
    discountedPrice: 2650,
    stock: 15,
    inStock: true,
  },
  {
    id: 'part-3',
    name: 'NGK Laser Iridium Spark Plug Set (Pack of 4)',
    partNumber: 'NGK-IZFR6K11',
    brand: 'NGK',
    category: 'Ignition & Electrical',
    description: 'Laser-welded iridium center electrode tip ensures high durability and greater spark efficiency.',
    price: 2400,
    discountedPrice: 1950,
    stock: 8,
    inStock: true,
  },
  {
    id: 'part-4',
    name: 'Brembo Premium Ceramic Front Brake Pads',
    partNumber: 'P23085N',
    brand: 'Brembo',
    category: 'Brakes',
    description: 'Reduces brake dust and noise while delivering exceptional stopping performance.',
    price: 3800,
    discountedPrice: 3199,
    stock: 12,
    inStock: true,
  },
  {
    id: 'part-5',
    name: 'Denso Cabin Air & Pollen Filter (PM 2.5)',
    partNumber: 'DEN-CF-88568',
    brand: 'Denso',
    category: 'Filters',
    description: 'Multi-layer activated charcoal filter that neutralizes odors, pollen, and airborne allergens.',
    price: 950,
    discountedPrice: 750,
    stock: 30,
    inStock: true,
  },
  {
    id: 'part-6',
    name: 'Exide Epiq 12V 45Ah Maintenance-Free Car Battery',
    partNumber: 'EPIQ45L',
    brand: 'Exide',
    category: 'Batteries',
    description: 'Heavy-duty alloy plates for extreme Indian summer weather with 66-month warranty.',
    price: 6500,
    discountedPrice: 5400,
    stock: 5,
    inStock: true,
  },
];

const categoriesList = ['All', 'Filters', 'Engine & Fluids', 'Brakes', 'Ignition & Electrical', 'Batteries'];

const SparePartsPage: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>(fallbackSpareParts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchParts = async () => {
      try {
        const res = await api.get('/spare-parts');
        if (isMounted) {
          if (Array.isArray(res.data?.data)) {
            setParts(res.data.data);
          } else if (Array.isArray(res.data)) {
            setParts(res.data);
          }
        }
      } catch {
        // Fallback parts already set
      }
    };

    fetchParts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (partName: string) => {
    setCartItemsCount((prev) => prev + 1);
    setNotification(`Preview cart: added "${partName}" locally. Checkout is not connected yet.`);
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const filteredParts = parts.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.partNumber && p.partNumber.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm animate-fade-in border border-gray-700">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Genuine Auto Spare Parts
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              100% Authentic OEM & OES components backed by manufacturer warranty.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-800">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Cart ({cartItemsCount})</span>
            </div>
          </div>
        </div>

        {/* Controls: Search and Categories */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part name, brand (Bosch, Brembo) or part number..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-gray-500 whitespace-nowrap mr-2">Category:</span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Spare Parts Grid */}
        {filteredParts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Parts Matching Search</h3>
            <p className="text-sm text-gray-500 mb-4">Try checking spelling or picking another category filter.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParts.map((part) => (
              <div
                key={part.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                {/* Image Placeholder */}
                <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center p-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-600">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-gray-700 shadow-xs flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-600" />
                    {part.brand}
                  </div>
                  {part.discountedPrice && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                      {Math.round(((part.price - part.discountedPrice) / part.price) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      {part.category} {part.partNumber ? `• SKU: ${part.partNumber}` : ''}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2">{part.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {part.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4 text-[11px] text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100% Genuine Guaranteed Part</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-extrabold text-gray-900">
                            ₹{(part.discountedPrice || part.price).toLocaleString()}
                          </span>
                          {part.discountedPrice && (
                            <span className="text-xs line-through text-gray-400">
                              ₹{part.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block">{part.inStock === false ? 'Out of Stock' : 'In Stock & Ready to Ship'}</span>
                      </div>
                      <button
                        disabled={part.inStock === false}
                        onClick={() => handleAddToCart(part.name)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SparePartsPage;
