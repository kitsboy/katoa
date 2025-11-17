export interface MockWishlistItem {
  id: string;
  title: string;
  description: string;
  price_sats: number;
  sats_raised: number;
  product_url: string;
  merchant: string;
  image_url: string;
  currency: string;
  original_price: number;
  is_funded: boolean;
  sort_order: number;
}

export const mockWishlistItems: Record<string, MockWishlistItem[]> = {
  'mock-featured': [
    {
      id: 'item-featured-1',
      title: 'Professional Concrete Ramps',
      description: 'High-quality concrete ramps, bowls, and street obstacles built to professional skateboarding standards',
      price_sats: 2000000,
      sats_raised: 1500000,
      product_url: 'https://www.example.com/concrete-ramps',
      merchant: 'Skatepark Construction Co',
      image_url: 'https://images.pexels.com/photos/19920069/pexels-photo-19920069.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 2000,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-featured-2',
      title: 'Safety Equipment Bundle (100 sets)',
      description: 'Helmets, knee pads, elbow pads, and wrist guards for program participants',
      price_sats: 1200000,
      sats_raised: 900000,
      product_url: 'https://www.amazon.com/Skateboarding-Safety-Equipment/dp/B08SAFE123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/18916334/pexels-photo-18916334.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 1200,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-featured-3',
      title: 'Complete Skateboards (50 units)',
      description: 'Quality beginner-friendly complete skateboards for program participants',
      price_sats: 800000,
      sats_raised: 600000,
      product_url: 'https://www.amazon.com/Complete-Skateboard-Beginners/dp/B08SKATE45',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/19920066/pexels-photo-19920066.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 800,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-featured-4',
      title: 'LED Lighting System',
      description: 'Professional LED lighting system for safe evening skating sessions',
      price_sats: 600000,
      sats_raised: 250000,
      product_url: 'https://www.amazon.com/Outdoor-LED-Lights/dp/B08LED7890',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/2681319/pexels-photo-2681319.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 600,
      is_funded: false,
      sort_order: 4,
    },
    {
      id: 'item-featured-5',
      title: 'First Aid Station Equipment',
      description: 'Complete first aid station with medical supplies, ice packs, and emergency equipment',
      price_sats: 400000,
      sats_raised: 0,
      product_url: 'https://www.amazon.com/First-Aid-Kit-Complete/dp/B08MED1234',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 400,
      is_funded: false,
      sort_order: 5,
    },
  ],
  'mock-001': [
    {
      id: 'item-001-1',
      title: 'Mathematics Textbooks (Set of 25)',
      description: 'Grade 4-6 mathematics textbooks in Spanish for our students',
      price_sats: 400000,
      sats_raised: 150000,
      product_url: 'https://www.amazon.com/Mathematics-Elementary-School-Textbook/dp/B08XYZ123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 400,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-001-2',
      title: 'Science Textbooks (Set of 25)',
      description: 'Elementary science books covering biology, chemistry, and physics basics',
      price_sats: 400000,
      sats_raised: 100000,
      product_url: 'https://www.amazon.com/Elementary-Science-Textbook-Spanish/dp/B08ABC456',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 400,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-001-3',
      title: 'Reading Books Set',
      description: 'Collection of 50 age-appropriate reading books in Spanish',
      price_sats: 500000,
      sats_raised: 200000,
      product_url: 'https://www.amazon.com/Spanish-Reading-Books-Children/dp/B08DEF789',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 500,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-001-4',
      title: 'School Supplies Bundle',
      description: 'Notebooks, pencils, erasers, rulers for 50 students',
      price_sats: 300000,
      sats_raised: 0,
      product_url: 'https://www.amazon.com/School-Supplies-Bulk/dp/B08GHI012',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 300,
      is_funded: false,
      sort_order: 4,
    },
  ],
  'mock-002': [
    {
      id: 'item-002-1',
      title: 'Yamaha FG800 Acoustic Guitar',
      description: 'Professional solid top acoustic guitar with excellent tone and projection',
      price_sats: 900000,
      sats_raised: 550000,
      product_url: 'https://www.amazon.com/Yamaha-FG800-Solid-Acoustic-Guitar/dp/B00H7LNM4Y',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 900,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-002-2',
      title: 'Guitar Strings 6-Pack',
      description: 'D\'Addario phosphor bronze acoustic guitar strings',
      price_sats: 60000,
      sats_raised: 60000,
      product_url: 'https://www.amazon.com/DAddario-Phosphor-Acoustic-Guitar-Strings/dp/B0002E1O4O',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/8191026/pexels-photo-8191026.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 60,
      is_funded: true,
      sort_order: 2,
    },
    {
      id: 'item-002-3',
      title: 'Guitar Case',
      description: 'Hard shell protective case for acoustic guitar',
      price_sats: 100000,
      sats_raised: 40000,
      product_url: 'https://www.amazon.com/Gator-Deluxe-Acoustic-Guitar-Case/dp/B0002ZGGYK',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/6671379/pexels-photo-6671379.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 100,
      is_funded: false,
      sort_order: 3,
    },
  ],
  'mock-003': [
    {
      id: 'item-003-1',
      title: 'First Aid Kits (10x Complete)',
      description: 'Comprehensive first aid kits with 200+ essential medical items',
      price_sats: 800000,
      sats_raised: 300000,
      product_url: 'https://www.amazon.com/First-Aid-Kit-Emergency/dp/B07VFHF58J',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 800,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-003-2',
      title: 'Digital Thermometers (20x)',
      description: 'Fast-read digital thermometers for accurate temperature readings',
      price_sats: 200000,
      sats_raised: 150000,
      product_url: 'https://www.amazon.com/Digital-Medical-Thermometer-Accurate/dp/B07XYZ789',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 200,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-003-3',
      title: 'Blood Pressure Monitors (5x)',
      description: 'Automatic digital blood pressure monitors with large displays',
      price_sats: 400000,
      sats_raised: 200000,
      product_url: 'https://www.amazon.com/Blood-Pressure-Monitor-Automatic/dp/B08ABC123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/7108337/pexels-photo-7108337.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 400,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-003-4',
      title: 'Stethoscopes Professional (10x)',
      description: 'High-quality stethoscopes for medical examinations',
      price_sats: 600000,
      sats_raised: 240000,
      product_url: 'https://www.amazon.com/Professional-Stethoscope-Medical/dp/B07DEF456',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 600,
      is_funded: false,
      sort_order: 4,
    },
  ],
  'mock-004': [
    {
      id: 'item-004-1',
      title: 'Dell Inspiron 15 Laptop',
      description: '15.6" FHD, Intel i5, 8GB RAM, 256GB SSD - Perfect for coding',
      price_sats: 1100000,
      sats_raised: 300000,
      product_url: 'https://www.amazon.com/Dell-Inspiron-15-Laptop/dp/B09XYZ123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 1100,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-004-2',
      title: 'Laptop Backpack',
      description: 'Protective laptop backpack with multiple compartments',
      price_sats: 50000,
      sats_raised: 20000,
      product_url: 'https://www.amazon.com/Laptop-Backpack-Business-Computer/dp/B07ABC456',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 50,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-004-3',
      title: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse for programming',
      price_sats: 30000,
      sats_raised: 0,
      product_url: 'https://www.amazon.com/Logitech-Wireless-Mouse/dp/B003NR57BY',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 30,
      is_funded: false,
      sort_order: 3,
    },
  ],
  'mock-005': [
    {
      id: 'item-005-1',
      title: 'Water Well Drilling Equipment',
      description: 'Professional drilling equipment to reach underground water sources',
      price_sats: 1500000,
      sats_raised: 800000,
      product_url: 'https://www.example.com/drilling-equipment',
      merchant: 'Industrial Supply Co',
      image_url: 'https://images.pexels.com/photos/2291636/pexels-photo-2291636.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 1500,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-005-2',
      title: 'Water Pump System',
      description: 'Solar-powered water pump to bring water to the surface',
      price_sats: 800000,
      sats_raised: 400000,
      product_url: 'https://www.amazon.com/Solar-Water-Pump-System/dp/B08PUMP123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 800,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-005-3',
      title: 'Water Storage Tank (5000L)',
      description: 'Large capacity water storage tank for the community',
      price_sats: 400000,
      sats_raised: 150000,
      product_url: 'https://www.amazon.com/Water-Storage-Tank-5000L/dp/B08TANK456',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 400,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-005-4',
      title: 'Water Filtration System',
      description: 'Complete filtration system to ensure clean drinking water',
      price_sats: 300000,
      sats_raised: 100000,
      product_url: 'https://www.amazon.com/Water-Filtration-System/dp/B08FILTER7',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 300,
      is_funded: false,
      sort_order: 4,
    },
  ],
  'mock-006': [
    {
      id: 'item-006-1',
      title: 'Adobe Creative Cloud (Annual)',
      description: 'Full Adobe Creative Suite subscription for design work',
      price_sats: 600000,
      sats_raised: 400000,
      product_url: 'https://www.adobe.com/creativecloud.html',
      merchant: 'Adobe',
      image_url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 600,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-006-2',
      title: 'Wacom Drawing Tablet',
      description: 'Professional drawing tablet for digital illustration and design',
      price_sats: 150000,
      sats_raised: 120000,
      product_url: 'https://www.amazon.com/Wacom-Intuos-Pro-Digital-Tablet/dp/B079HL9YSF',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/5797902/pexels-photo-5797902.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 150,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-006-3',
      title: 'External Monitor 27"',
      description: '4K monitor for better design workflow and productivity',
      price_sats: 50000,
      sats_raised: 40000,
      product_url: 'https://www.amazon.com/Monitor-27-inch-4K-UHD/dp/B08MONITOR',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 50,
      is_funded: false,
      sort_order: 3,
    },
  ],
  'mock-007': [
    {
      id: 'item-007-1',
      title: 'Trail Camera (12 units)',
      description: 'High-resolution wildlife cameras with night vision and motion detection',
      price_sats: 900000,
      sats_raised: 650000,
      product_url: 'https://www.amazon.com/Trail-Camera-Wildlife-Monitoring/dp/B08CAM1234',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/414579/pexels-photo-414579.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 900,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-007-2',
      title: 'SD Cards (24x 128GB)',
      description: 'High-capacity SD cards for storing camera trap footage',
      price_sats: 200000,
      sats_raised: 180000,
      product_url: 'https://www.amazon.com/SanDisk-128GB-SD-Card/dp/B073JYC4XM',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 200,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-007-3',
      title: 'Solar Panel Kits',
      description: 'Solar charging kits to power cameras in remote locations',
      price_sats: 300000,
      sats_raised: 200000,
      product_url: 'https://www.amazon.com/Solar-Panel-Kit-Wildlife-Camera/dp/B08SOLAR89',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 300,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-007-4',
      title: 'Weatherproof Cases',
      description: 'Protective cases for cameras in harsh outback conditions',
      price_sats: 100000,
      sats_raised: 70000,
      product_url: 'https://www.amazon.com/Weatherproof-Camera-Case/dp/B08CASE567',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/2582935/pexels-photo-2582935.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 100,
      is_funded: false,
      sort_order: 4,
    },
  ],
  'mock-008': [
    {
      id: 'item-008-1',
      title: 'Organic Seeds Collection',
      description: 'Variety pack of organic vegetable and herb seeds for urban garden',
      price_sats: 150000,
      sats_raised: 130000,
      product_url: 'https://www.amazon.com/Organic-Seeds-Variety-Pack/dp/B08SEED123',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 150,
      is_funded: false,
      sort_order: 1,
    },
    {
      id: 'item-008-2',
      title: 'Garden Tools Set',
      description: 'Complete set of essential gardening tools for community use',
      price_sats: 200000,
      sats_raised: 180000,
      product_url: 'https://www.amazon.com/Garden-Tools-Set-Complete/dp/B08TOOLS45',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4505160/pexels-photo-4505160.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 200,
      is_funded: false,
      sort_order: 2,
    },
    {
      id: 'item-008-3',
      title: 'Raised Bed Materials',
      description: 'Lumber and materials for building 15 raised garden beds',
      price_sats: 150000,
      sats_raised: 120000,
      product_url: 'https://www.homedepot.com/raised-bed-materials',
      merchant: 'Home Depot',
      image_url: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 150,
      is_funded: false,
      sort_order: 3,
    },
    {
      id: 'item-008-4',
      title: 'Composting System',
      description: 'Large composting bins and starter materials for waste reduction',
      price_sats: 100000,
      sats_raised: 50000,
      product_url: 'https://www.amazon.com/Composting-System-Large/dp/B08COMPOST',
      merchant: 'Amazon',
      image_url: 'https://images.pexels.com/photos/4505166/pexels-photo-4505166.jpeg?auto=compress&cs=tinysrgb&w=400',
      currency: 'USD',
      original_price: 100,
      is_funded: false,
      sort_order: 4,
    },
  ],
};

export const mockWishlists = [
  {
    id: 'mock-001',
    title: 'School in Guatemala Needs Textbooks',
    description: 'Help provide educational materials for 50 students in rural Guatemala. These textbooks will enable children to continue their education and build a better future.',
    created_at: '2025-10-15T10:00:00Z',
    full_story: `Our school, Escuela Esperanza, serves a rural community in the highlands near Antigua, Guatemala. For the past three years, our 50 students have been sharing 10 outdated textbooks between them. Many children cannot complete their homework because they don't have access to the materials they need.

The children here are incredibly motivated to learn. They wake up at 5 AM and walk up to two hours through mountain paths to reach our school. They deserve to have the proper tools to succeed. With your help, we can purchase 25 mathematics textbooks, 25 science books, reading materials for all grade levels, and essential writing supplies.

This investment will directly impact 50 children this year, and these books will serve hundreds more students in the years to come. Education is the key to breaking the cycle of poverty in our community. Every satoshi you contribute brings these children one step closer to a brighter future.

Our teacher, María López, has been teaching here for 15 years with minimal resources. She says, "These children have so much potential. All they need is the chance to learn." Your support will give them that chance.`,
    slug: 'guatemala-school-textbooks',
    cover_image: 'https://images.pexels.com/photos/8500347/pexels-photo-8500347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 1600000,
    total_sats_raised: 450000,
    country: 'Guatemala',
    country_code: 'GT',
    country_flag: '🇬🇹',
    city: 'Antigua',
    latitude: 14.5586,
    longitude: -90.7339,
    creator: {
      username: 'guatemala_education',
      avatar_url: null,
    },
  },
  {
    id: 'mock-002',
    title: 'Paul the Artist Needs a Guitar',
    description: 'I am a street musician in Nashville trying to save up for a quality acoustic guitar. Music is my passion and livelihood. Any support appreciated!',
    created_at: '2025-10-18T14:30:00Z',
    full_story: `Hey there! My name is Paul Henderson, and I've been playing music on the streets of Nashville for the past five years. Music has always been my calling, but my current guitar is falling apart after years of daily use. The neck is warped, several frets are worn down, and it barely stays in tune anymore.

I perform six days a week on Broadway, sharing original songs and classic covers with tourists and locals alike. Music is not just my passion—it's how I make my living and connect with people. I've played through rain, snow, and scorching heat because I believe in the power of live music to bring joy to people's lives.

A quality Yamaha FG800 acoustic guitar would be a game-changer for me. It's known for its rich tone, durability, and excellent projection—perfect for street performance. With a reliable instrument, I could finally record my original songs properly and maybe even release an album.

I'm not asking for handouts—I work hard every single day. But saving up while paying rent and living expenses in Nashville has been nearly impossible. Your support would mean the world to me and help keep live music alive on these streets. Thank you for considering helping a fellow musician chase their dream.`,
    slug: 'paul-artist-guitar',
    cover_image: 'https://images.pexels.com/photos/1751731/pexels-photo-1751731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 1000000,
    total_sats_raised: 650000,
    country: 'United States',
    country_code: 'US',
    country_flag: '🇺🇸',
    city: 'Nashville',
    latitude: 36.1627,
    longitude: -86.7816,
    creator: {
      username: 'paul_music',
      avatar_url: null,
    },
  },
  {
    id: 'mock-003',
    title: 'Medical Supplies for Kenya Clinic',
    description: 'Our rural clinic serves 2,000 families but lacks basic medical supplies. Help us stock essential medicines and equipment.',
    created_at: '2025-10-20T09:15:00Z',
    full_story: `Jambo! The Tumaini Health Clinic serves a rural community of over 2,000 families in the outskirts of Nairobi, Kenya. We are the only medical facility within a 30-kilometer radius, and families often walk for hours to reach us. Despite the tremendous need, we operate with critically low supplies.

Our clinic sees an average of 80 patients per day, ranging from children with malaria to mothers in labor to elderly patients with chronic conditions. Too often, we must turn patients away or provide inadequate care because we lack basic medicines, first aid supplies, and diagnostic equipment.

With your support, we will purchase: 10 comprehensive first aid kits, essential medicines including antibiotics and pain relievers, and basic medical equipment like thermometers, blood pressure monitors, and stethoscopes. These supplies will enable us to treat thousands of patients over the next year.

Dr. James Omondi, our lead physician, works tirelessly with a small staff of nurses and volunteers. "We see miracles happen here every day despite our limitations," he says. "With proper supplies, we could save so many more lives."

Your contribution will directly impact the health and wellbeing of an entire community. In rural Kenya, access to basic medical care can mean the difference between life and death. Thank you for helping us continue our mission of healing and hope.`,
    slug: 'kenya-medical-supplies',
    cover_image: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 2400000,
    total_sats_raised: 890000,
    country: 'Kenya',
    country_code: 'KE',
    country_flag: '🇰🇪',
    city: 'Nairobi',
    latitude: -1.2864,
    longitude: 36.8172,
    creator: {
      username: 'nairobi_clinic',
      avatar_url: null,
    },
  },
  {
    id: 'mock-004',
    title: 'Maria Dreams of Becoming a Developer',
    description: 'I am a 19-year-old from Brazil learning to code. I need a laptop to complete my studies and start freelancing. This will change my life!',
    created_at: '2025-10-25T16:45:00Z',
    full_story: `Olá! My name is Maria Silva, and I'm a 19-year-old aspiring software developer from São Paulo, Brazil. I discovered programming two years ago at a free community coding workshop, and it completely changed my life. For the first time, I felt like I had found something I was truly good at and passionate about.

Since then, I've been learning everything I can through free online resources, completing courses on freeCodeCamp, and practicing coding challenges. But I've been doing all of this on borrowed computers at the public library and internet cafes, which limits my learning time to just a few hours per week.

I recently completed a full-stack web development course and earned my certificate, but without a laptop, I can't build a portfolio or take on freelance projects. A reliable laptop would allow me to code every day, build real projects, contribute to open source, and eventually support my family through tech work.

I come from a low-income family. My mother works as a housecleaner, and my father drives a bus. They've supported my education as much as possible, but a laptop is beyond our means right now. I'm not asking for a high-end machine—just a dependable Dell Inspiron that can run my development tools.

This isn't just about getting a laptop. It's about breaking the cycle of poverty through technology and education. Your support would give me the tool I need to build a career and eventually give back to my community by teaching others to code. Muito obrigada for believing in my dream!`,
    slug: 'maria-developer-laptop',
    cover_image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 1200000,
    total_sats_raised: 320000,
    country: 'Brazil',
    country_code: 'BR',
    country_flag: '🇧🇷',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    creator: {
      username: 'maria_codes',
      avatar_url: null,
    },
  },
  {
    id: 'mock-005',
    title: 'Clean Water Project - Nigeria',
    description: 'Building a well to provide clean drinking water for a village of 300 people. Every satoshi brings us closer to clean water for all.',
    created_at: '2025-11-01T11:20:00Z',
    full_story: `Welcome! Water For Life Nigeria is a community-led initiative working to bring clean drinking water to rural villages. Our current project focuses on Oke Village, home to approximately 300 people who currently have no access to clean water.

The nearest clean water source is 5 kilometers away, and villagers—mostly women and children—make this journey twice a day carrying heavy containers. This exhausting routine prevents children from attending school regularly and exposes everyone to dangers along the route. Many families resort to drinking from contaminated streams, leading to frequent outbreaks of waterborne diseases.

We have partnered with local drilling experts and water engineers to install a sustainable borehole well with a hand pump. The well will be drilled to 60 meters depth to access clean groundwater, and a maintenance committee of village members will be trained to ensure its long-term operation.

The impact of this project cannot be overstated. Clean water means children can attend school consistently. It means women can use their time for education or income-generating activities. It means fewer illnesses and deaths from preventable diseases. One well will serve this community for decades to come.

Our project manager, Chinwe Okafor, grew up in a village without clean water. "I know what it's like to wake up at 4 AM to fetch water instead of going to school," she says. "No child should have to make that choice in 2025."

Every contribution brings us closer to breaking ground on this well. Join us in giving the gift of clean water—the foundation of health, education, and prosperity. Thank you!`,
    slug: 'nigeria-clean-water',
    cover_image: 'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 3000000,
    total_sats_raised: 1450000,
    country: 'Nigeria',
    country_code: 'NG',
    country_flag: '🇳🇬',
    city: 'Lagos',
    latitude: 6.5244,
    longitude: 3.3792,
    creator: {
      username: 'water4life',
      avatar_url: null,
    },
  },
  {
    id: 'mock-006',
    title: 'Tokyo Startup Needs Design Tools',
    description: 'Small tech startup building accessibility tools for visually impaired users. Need design software licenses to complete our MVP.',
    created_at: '2025-11-05T08:00:00Z',
    full_story: `こんにちは (Konnichiwa)! We are AccessTech Tokyo, a small startup team of three developers passionate about making technology more accessible for people with visual impairments. Our flagship product, VoiceNav, is a screen reader that uses AI to provide more natural and context-aware audio descriptions of digital content.

Our team includes Yuki (our lead developer who is herself visually impaired), Hiroshi (AI specialist), and Kenji (UX researcher). We've been working on VoiceNav for the past year, mostly after our day jobs and on weekends. We've built a functional prototype that's already being tested by 50 beta users, and the feedback has been overwhelmingly positive.

To complete our MVP and launch publicly, we need professional design software licenses—specifically Adobe Creative Cloud for UI mockups and Figma for collaborative design work. While we're developers at heart, we've learned that good visual design is crucial even (especially!) for accessibility tools, as many low-vision users still have some sight and benefit from thoughtful visual design.

We're bootstrapping this startup without venture capital because we want to keep our tool affordable and accessible to everyone who needs it. In Japan alone, there are over 300,000 people with visual impairments, and worldwide the need is in the millions.

Our vision is to launch VoiceNav as a free basic tool with premium features for sustainable revenue. But first, we need to finish the product. Your support will help us obtain the professional tools we need to complete development and launch within the next three months.

Every contribution brings us closer to making the internet a more accessible place for everyone. ありがとうございます (Arigatou gozaimasu - Thank you very much)!`,
    slug: 'tokyo-startup-design',
    cover_image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 800000,
    total_sats_raised: 560000,
    country: 'Japan',
    country_code: 'JP',
    country_flag: '🇯🇵',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    creator: {
      username: 'accessible_tech',
      avatar_url: null,
    },
  },
  {
    id: 'mock-007',
    title: 'Wildlife Conservation in Australia',
    description: 'Protecting endangered species in the Outback. Funds will go toward camera equipment for monitoring wildlife populations.',
    created_at: '2025-11-08T13:30:00Z',
    full_story: `G'day! I'm Steve Morrison, a wildlife conservationist working in the Australian Outback for the past 12 years. My team and I are dedicated to protecting endangered species in one of the most remote and harsh environments on Earth.

The Australian Outback is home to incredible biodiversity, but many species are under threat from climate change, habitat loss, and invasive species. We focus on monitoring and protecting several critically endangered species including the Bilby, the Greater Stick-nest Rat, and various native bird species.

Our primary method of monitoring wildlife populations is through camera traps—motion-activated cameras placed throughout the territory that capture images of animals without disturbing them. However, our current equipment is outdated and failing. Many cameras no longer work, which means we have huge gaps in our data and can't effectively track population changes or identify threats.

We need to purchase 12 new wildlife camera traps with night vision, weatherproof housing, and SD cards for data storage. These cameras will be placed at strategic locations across 50,000 acres of protected land, allowing us to monitor wildlife 24/7 throughout the year.

The data we collect isn't just for research—it directly informs our conservation strategies. For example, last year our cameras revealed a new threat to local Bilbies, and we were able to intervene before the population was seriously impacted. This kind of real-time monitoring is crucial for protecting vulnerable species.

We're a small nonprofit running on passion and minimal funding. Every dollar goes directly to conservation work. Your support will help us continue protecting the unique wildlife of the Australian Outback for future generations. Thank you, mate!`,
    slug: 'australia-wildlife-conservation',
    cover_image: 'https://images.pexels.com/photos/1122656/pexels-photo-1122656.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 1500000,
    total_sats_raised: 1100000,
    country: 'Australia',
    country_code: 'AU',
    country_flag: '🇦🇺',
    city: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    creator: {
      username: 'aussie_wildlife',
      avatar_url: null,
    },
  },
  {
    id: 'mock-008',
    title: 'Community Garden in Berlin',
    description: 'Creating an urban garden to teach kids about sustainability and healthy eating. Need seeds, tools, and supplies to get started.',
    created_at: '2025-11-10T10:00:00Z',
    full_story: `Guten Tag! I'm Anna Schmidt, a community organizer in Berlin, Germany. For the past three years, I've been working with local families to transform an abandoned lot in our neighborhood into a thriving community garden where children can learn about sustainable food production and healthy eating.

Our neighborhood, Neukölln, is a vibrant multicultural area with many young families, but it's heavily urbanized with limited green space. Children here grow up surrounded by concrete, with little understanding of where their food comes from or how to grow it themselves.

We've secured permission to use a 500 square meter plot, and over 30 families have signed up to participate. Our vision is to create raised garden beds where children and families can grow vegetables, herbs, and flowers. We'll also include a small greenhouse for year-round growing, a composting station to teach about waste reduction, and a community gathering space.

The funds we're raising will purchase: organic seeds and seedlings for initial planting, essential gardening tools (shovels, rakes, watering cans), lumber and materials for building 15 raised beds, a small greenhouse structure, composting bins, and educational materials about sustainable gardening.

This project is about more than just growing vegetables. It's about bringing our diverse community together, teaching children valuable life skills, promoting healthy eating habits, and creating a green oasis in our urban environment. Studies show that children who grow their own food are much more likely to eat vegetables and develop lifelong healthy eating habits.

We've already organized volunteer teams for construction and maintenance. All we need now are the supplies to get started. Your support will help create a lasting resource for our community and inspire the next generation of urban gardeners. Vielen Dank (Thank you very much)!`,
    slug: 'berlin-community-garden',
    cover_image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 600000,
    total_sats_raised: 480000,
    country: 'Germany',
    country_code: 'DE',
    country_flag: '🇩🇪',
    city: 'Berlin',
    latitude: 52.5200,
    longitude: 13.4050,
    creator: {
      username: 'berlin_green',
      avatar_url: null,
    },
  },
  {
    id: 'mock-featured',
    title: 'Skateboard Park for Medellín Youth',
    description: 'Transform lives through skateboarding. Building a safe community space where 500+ youth can skate, learn, and grow together with free lessons and mentorship.',
    created_at: '2025-11-01T08:00:00Z',
    full_story: `¡Hola! I'm Carlos Ramirez, founder of Skate Colombia Foundation. For the past eight years, I've dedicated my life to using skateboarding as a tool for social change in Medellín, Colombia.

Growing up in Comuna 13, one of Medellín's most challenging neighborhoods, I witnessed firsthand how limited opportunities and lack of safe spaces affect young people. Skateboarding saved my life—it gave me purpose, discipline, and a positive community when I needed it most.

Now, I want to create that same opportunity for the next generation. We're building a full-scale skatepark in the heart of Comuna 13 that will serve over 500 youth. This isn't just about building ramps—it's about building futures.

Our program includes:
• Free skateboarding lessons for beginners (ages 8-18)
• Weekly workshops on life skills, conflict resolution, and goal setting
• Mentorship program pairing experienced skaters with newcomers
• Scholarship opportunities for talented skaters to compete nationally
• Safe space open 6 days a week, supervised by trained staff

We've already secured the land (donated by the city) and gathered a team of 15 volunteer instructors. We've also partnered with local schools to identify youth who would benefit most from the program.

The funds we're raising will cover:
• Construction of professional-grade concrete ramps and bowls
• Safety equipment (helmets, pads) for 100+ participants
• Basic skateboards for program participants
• Lighting for evening sessions
• First aid station and emergency equipment

Skateboarding taught me that falling is part of learning, but getting back up is what defines you. Every donation helps us create a space where kids learn this invaluable lesson while staying away from negative influences.

We're 65% funded and construction is ready to begin! Your support will directly impact hundreds of young lives. ¡Gracias por su apoyo!`,
    slug: 'medellin-skate-park',
    cover_image: 'https://images.pexels.com/photos/5793678/pexels-photo-5793678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    total_sats_goal: 5000000,
    total_sats_raised: 3250000,
    country: 'Colombia',
    country_code: 'CO',
    country_flag: '🇨🇴',
    city: 'Medellín',
    latitude: 6.2476,
    longitude: -75.5658,
    creator: {
      username: 'skate_colombia',
      avatar_url: null,
      lightning_address: 'carlos@getalby.com',
      bio: 'Founder of Skate Colombia Foundation. Using skateboarding to empower youth in Medellín. Former pro skater, now full-time social entrepreneur.',
    },
  },
];
