import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Support & Inquiries</span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            We're Here to Help
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Have questions about doorstep service, partner registration, or order tracking? Contact our support team.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Call Us 24/7</h3>
              <p className="text-xs text-gray-500 mb-2">Toll-free customer hotline & roadside SOS</p>
              <a href="tel:18002004567" className="text-sm font-bold text-blue-600 hover:underline">
                +91 1800 200 4567
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Email Support</h3>
              <p className="text-xs text-gray-500 mb-2">Average response time within 2 hours</p>
              <a href="mailto:support@autopro.in" className="text-sm font-bold text-blue-600 hover:underline">
                support@autopro.in
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Corporate Headquarters</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Auto Pro Tech Park, Outer Ring Road, Bellandur, Bangalore, Karnataka 560103
              </p>
            </div>
          </div>
        </div>

        {/* Form and Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-xs text-gray-500 mb-6">
              Fill in your details below and an Auto Pro specialist will get back to you immediately.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-900">Message Received!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you, <strong className="text-emerald-900">{formData.name}</strong>. Our customer assistance desk has received your request and will reach out shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Topic / Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Doorstep Service Booking">Doorstep Service Booking</option>
                    <option value="Spare Parts Order Status">Spare Parts Order Status</option>
                    <option value="Mechanic Partner Application">Mechanic Partner Application</option>
                    <option value="Used Car Inspection">Used Car Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your requirement, vehicle model, or query..."
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Location Map Placeholder & Operating Hours */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Headquarters & Innovation Hub
              </h3>
              {/* Google Maps Styled Embed Placeholder */}
              <div className="w-full h-72 rounded-2xl bg-slate-100 border border-gray-200 relative flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Auto Pro HQ • Bangalore</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Plot 42, Outer Ring Road Technology Corridor, Bangalore, Karnataka
                </p>
                <div className="mt-4 px-3 py-1 bg-white rounded-full border border-gray-200 text-[11px] font-semibold text-gray-600 shadow-xs">
                  Coordinates: 12.9279° N, 77.6271° E
                </div>
              </div>
            </div>

            <div className="bg-blue-900 text-white rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Operating Hours</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  • Doorstep Mechanics: 7:00 AM – 9:00 PM (Monday to Sunday) <br />
                  • 24x7 Roadside Breakdown Hotline & Emergency Assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
