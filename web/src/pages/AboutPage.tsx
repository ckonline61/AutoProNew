import { Target, Eye, Award } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Certified Mechanics', sub: 'Trained & verified nationwide' },
  { value: '50+', label: 'Cities Covered', sub: 'Across Tier 1 & Tier 2 hubs' },
  { value: '100K+', label: 'Services Completed', sub: 'With 4.8/5 customer rating' },
  { value: '100%', label: 'Genuine Spare Parts', sub: 'OEM & OES direct warranty' },
];

const teamMembers = [
  {
    name: 'Aarav Singhania',
    role: 'Founder & CEO',
    bio: 'Former automotive engineer with 15+ years experience building mobility platforms across Asia.',
  },
  {
    name: 'Dr. Meera Nambiar',
    role: 'Chief Technology Officer',
    bio: 'Specialist in real-time dispatch systems, IoT diagnostics, and scalable cloud architectures.',
  },
  {
    name: 'Rohan Deshmukh',
    role: 'Head of Service Operations',
    bio: 'Automotive master technician with extensive track record in dealership network quality control.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Auto Pro</span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Redefining Car Maintenance Across India
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Auto Pro was established to bring radical transparency, doorstep convenience, and guaranteed engineering excellence to the Indian automotive aftermarket.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">{s.value}</div>
              <div className="text-sm font-bold text-gray-900">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Company Story */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Our Genesis</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 mb-4">
              Built by car enthusiasts, engineered for every Indian family
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                For decades, servicing a personal car meant losing entire weekends at crowded workshops, dealing with ambiguous billing estimates, and wondering if genuine fluids and parts were actually installed.
              </p>
              <p>
                Auto Pro changed that forever in 2026 by combining digital diagnostics, on-demand certified mobile mechanics, and direct manufacturer supply chains. We bring the garage to your driveway, allowing you to observe every inspection and part replacement firsthand.
              </p>
              <p>
                From periodic fluid changes to emergency roadside breakdowns, our digital platform operates 24/7 to keep India moving safely.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-tr from-blue-900 to-indigo-800 text-white rounded-2xl p-8 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Uncompromising Quality Standards</h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Every mechanic on our roster goes through rigorous background screening, theory examination, and practical vehicle diagnostic vetting before serving customers.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-700/60">
              <div>
                <div className="text-xl font-bold">30 Days</div>
                <div className="text-[11px] text-blue-200">Workmanship Warranty</div>
              </div>
              <div>
                <div className="text-xl font-bold">100% OEM</div>
                <div className="text-[11px] text-blue-200">Verified Spare Parts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To empower car owners across India with frictionless doorstep vehicle care, honest transparent pricing, and rapid emergency assistance while elevating mechanic livelihoods through technology.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To become South Asia’s most trusted full-stack auto platform — encompassing predictive diagnostics, genuine part distributions, doorstep servicing, and certified pre-owned car ecosystems.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Leadership</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Driven by Passion & Engineering
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Meet the minds guiding Auto Pro’s mission toward seamless car ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-xl font-black">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h4 className="text-base font-bold text-gray-900">{member.name}</h4>
                <div className="text-xs font-semibold text-blue-600 mb-3">{member.role}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold">Join the Auto Pro Partner Network</h3>
            <p className="text-blue-100 text-sm">
              Are you an experienced automotive technician or workshop owner? Grow your income and build a verified career with Auto Pro.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-xs sm:text-sm hover:bg-blue-50 transition shrink-0 shadow-md"
          >
            Apply as Mechanic Partner
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
