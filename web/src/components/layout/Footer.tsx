import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                AUTO <span className="text-blue-500">PRO</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              India's premier auto care platform delivering seamless doorstep car servicing, verified genuine spare parts, and certified used cars with complete transparency.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition text-xs font-bold"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition text-xs font-bold"
                aria-label="Twitter"
              >
                X
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition text-xs font-bold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition text-xs font-bold"
                aria-label="LinkedIn"
              >
                IN
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="hover:text-blue-400 transition">
                  Car Services
                </Link>
              </li>
              <li>
                <Link to="/spare-parts" className="hover:text-blue-400 transition">
                  Genuine Spare Parts
                </Link>
              </li>
              <li>
                <Link to="/used-cars" className="hover:text-blue-400 transition">
                  Certified Used Cars
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policies */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Policies & Trust</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Doorstep Warranty Protection</span>
              </li>
              <li>
                <span className="text-gray-400">Mechanic Partner Terms</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Auto Pro Tech Park, Outer Ring Road, Bangalore, Karnataka 560103, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>+91 1800 200 4567 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>support@autopro.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Auto Pro Technologies Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="text-red-500">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
