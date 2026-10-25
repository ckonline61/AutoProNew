import { AppConfig } from '../models/app-config.model';

/**
 * Default App Config values — seeded on first startup if keys don't exist.
 */
const DEFAULT_CONFIGS = [
  {
    key: 'theme',
    value: {
      primaryColor: '#E53E3E',
      secondaryColor: '#2D3748',
      accentColor: '#ED8936',
      backgroundColor: '#FFFFFF',
      cardColor: '#F7FAFC',
      textColor: '#1A202C',
      buttonRadius: 12,
    },
    type: 'JSON',
    description: 'App theme colors and styling',
  },
  {
    key: 'home_welcome_text',
    value: 'Welcome to Auto Pro! 🚗',
    type: 'STRING',
    description: 'Home screen welcome message',
  },
  {
    key: 'home_banners',
    value: [
      { imageUrl: 'https://via.placeholder.com/800x300/E53E3E/FFFFFF?text=Auto+Pro+Service', title: 'Premium Service', enabled: true },
      { imageUrl: 'https://via.placeholder.com/800x300/2D3748/FFFFFF?text=50%25+Off+First+Service', title: '50% Off', enabled: true },
    ],
    type: 'JSON',
    description: 'Home screen banner carousel images',
  },
  {
    key: 'home_sections_order',
    value: ['banners', 'services', 'offers', 'recent_bookings'],
    type: 'JSON',
    description: 'Order of sections on home screen',
  },
  {
    key: 'feature_google_signin',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable Google Sign-In on login screen',
  },
  {
    key: 'feature_sos_button',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable SOS Emergency button',
  },
  {
    key: 'feature_live_tracking',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable live mechanic tracking on map',
  },
  {
    key: 'feature_razorpay',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable Razorpay online payment',
  },
  {
    key: 'feature_offers',
    value: true,
    type: 'BOOLEAN',
    description: 'Show offers/coupons section',
  },
  {
    key: 'feature_saved_cars',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable saved cars/vehicles feature',
  },
  {
    key: 'feature_service_history',
    value: true,
    type: 'BOOLEAN',
    description: 'Show service history screen',
  },
  {
    key: 'feature_ratings',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable ratings & reviews',
  },
  {
    key: 'feature_referral',
    value: false,
    type: 'BOOLEAN',
    description: 'Enable referral system (Coming Soon)',
  },
  {
    key: 'feature_chat_support',
    value: false,
    type: 'BOOLEAN',
    description: 'Enable in-app chat support (Coming Soon)',
  },
  {
    key: 'service_categories',
    value: [
      { id: 'general', name: 'General Service', icon: '🔧', enabled: true, price: '₹999' },
      { id: 'ac', name: 'AC Service', icon: '❄️', enabled: true, price: '₹1499' },
      { id: 'battery', name: 'Battery', icon: '🔋', enabled: true, price: '₹799' },
      { id: 'tyre', name: 'Tyre Service', icon: '🛞', enabled: true, price: '₹599' },
      { id: 'denting', name: 'Denting & Painting', icon: '🎨', enabled: true, price: '₹2999' },
      { id: 'inspection', name: 'Car Inspection', icon: '🔍', enabled: true, price: '₹499' },
      { id: 'oil', name: 'Oil Change', icon: '🛢️', enabled: true, price: '₹699' },
      { id: 'wash', name: 'Car Wash', icon: '🚿', enabled: true, price: '₹299' },
    ],
    type: 'JSON',
    description: 'Service categories shown in app',
  },
  {
    key: 'app_info',
    value: {
      companyName: 'Auto Pro',
      supportPhone: '+91 9000000001',
      supportEmail: 'support@autopro.in',
      aboutUs: 'Auto Pro - Your trusted vehicle service partner. Professional mechanics at your doorstep.',
      termsUrl: 'https://autopro.in/terms',
      privacyUrl: 'https://autopro.in/privacy',
      websiteUrl: 'https://autopro.in',
    },
    type: 'JSON',
    description: 'App information and contact details',
  },
  {
    key: 'maintenance',
    value: {
      enabled: false,
      title: 'Under Maintenance',
      message: 'App maintenance mein hai. Jaldi wapas aayenge!',
      estimatedTime: '',
    },
    type: 'JSON',
    description: 'Maintenance mode configuration',
  },
  {
    key: 'announcement',
    value: {
      enabled: false,
      text: '',
      type: 'info',
      dismissable: true,
    },
    type: 'JSON',
    description: 'Top announcement bar in app',
  },
];

/**
 * Seed default configurations if they don't exist.
 * Safe to call multiple times — only inserts missing keys.
 */
export async function seedDefaultConfigs(): Promise<void> {
  let inserted = 0;

  for (const cfg of DEFAULT_CONFIGS) {
    const exists = await AppConfig.findOne({ key: cfg.key });
    if (!exists) {
      await AppConfig.create({
        key: cfg.key,
        value: cfg.value,
        type: cfg.type,
        description: cfg.description,
        version: 1,
      });
      inserted++;
    }
  }

  if (inserted > 0) {
    console.log(`[Seed] Inserted ${inserted} default app config entries`);
  }
}
