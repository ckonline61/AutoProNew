import { AppConfig } from '../models/app-config.model';

type CfgType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

interface SeedEntry {
  key: string;
  value: any;
  type: CfgType;
  description: string;
}

/**
 * Default App Config values — seeded on first startup if keys don't exist.
 */
const DEFAULT_CONFIGS: SeedEntry[] = [
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
    key: 'feature_apple_signin',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable Apple Sign-In on login screen',
  },
  {
    key: 'feature_whatsapp_login',
    value: false,
    type: 'BOOLEAN',
    description: 'Enable WhatsApp Login on login screen',
  },
  {
    key: 'feature_email_login',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable Email/Password login tab',
  },
  {
    key: 'feature_phone_login',
    value: true,
    type: 'BOOLEAN',
    description: 'Enable Phone OTP login tab',
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
  // Mechanic App Defaults
  {
    key: 'mechanic_live_location',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Allow sharing live location with customer',
  },
  {
    key: 'mechanic_earnings_dashboard',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Enable earnings dashboard',
  },
  {
    key: 'mechanic_sos_alerts',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Enable SOS emergency alerts',
  },
  {
    key: 'mechanic_job_notifications',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Push notifications for new jobs',
  },
  {
    key: 'mechanic_chat_with_customer',
    value: false,
    type: 'BOOLEAN',
    description: 'Mechanic: Chat with customer (Coming Soon)',
  },
  {
    key: 'mechanic_document_upload',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Document and license upload',
  },
  {
    key: 'mechanic_training_videos',
    value: false,
    type: 'BOOLEAN',
    description: 'Mechanic: Training videos section',
  },
  {
    key: 'mechanic_incentive_tracker',
    value: false,
    type: 'BOOLEAN',
    description: 'Mechanic: Incentive tracker',
  },
  {
    key: 'mechanic_phone_login',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Phone OTP login',
  },
  {
    key: 'mechanic_email_login',
    value: true,
    type: 'BOOLEAN',
    description: 'Mechanic: Email/password login',
  },
  {
    key: 'mechanic_whatsapp_login',
    value: false,
    type: 'BOOLEAN',
    description: 'Mechanic: WhatsApp login',
  },
  {
    key: 'mechanic_maintenance',
    value: {
      enabled: false,
      title: 'Under Maintenance',
      message: 'Mechanic app maintenance mein hai. Jaldi wapas aayenge!',
      estimatedTime: '',
    },
    type: 'JSON',
    description: 'Mechanic App Maintenance mode configuration',
  },
  {
    key: 'mechanic_announcement',
    value: {
      enabled: false,
      text: '',
      type: 'info',
      dismissable: true,
    },
    type: 'JSON',
    description: 'Mechanic App announcement banner',
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
