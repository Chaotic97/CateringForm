import db from './db.ts';
import bcrypt from 'bcrypt';

// Menu items from the hardcoded config
const MENU_ITEMS = [
  { id: 'app-1', name: 'Crispy Pork Dumplings', description: 'Pan-fried with black vinegar and chili oil', category: 'appetizer', pricePerPerson: 4, isSignature: true, dietaryTags: [], allergens: ['wheat', 'soy', 'sesame'], available: true, sortOrder: 1 },
  { id: 'app-2', name: 'Szechuan Wontons', description: 'Pork and shrimp in spicy sesame sauce', category: 'appetizer', pricePerPerson: 4, isSignature: false, dietaryTags: ['spicy'], allergens: ['wheat', 'shellfish', 'soy', 'sesame'], available: true, sortOrder: 2 },
  { id: 'app-3', name: 'Vegetable Spring Rolls', description: 'Crispy rolls with sweet chili dipping sauce', category: 'appetizer', pricePerPerson: 3, isSignature: false, dietaryTags: ['vegetarian', 'vegan'], allergens: ['wheat', 'soy'], available: true, sortOrder: 3 },
  { id: 'app-4', name: 'Salt & Pepper Calamari', description: 'Wok-tossed with jalapeño and garlic', category: 'appetizer', pricePerPerson: 5, isSignature: true, dietaryTags: ['spicy'], allergens: ['shellfish', 'wheat'], available: true, sortOrder: 4 },
  { id: 'app-5', name: 'Scallion Pancakes', description: 'Flaky and golden with ginger soy dip', category: 'appetizer', pricePerPerson: 3, isSignature: false, dietaryTags: ['vegetarian'], allergens: ['wheat', 'soy', 'eggs'], available: true, sortOrder: 5 },
  { id: 'soup-1', name: 'Hot & Sour Soup', description: 'Traditional with tofu, mushroom, and egg', category: 'soup', pricePerPerson: 3, isSignature: false, dietaryTags: ['spicy'], allergens: ['soy', 'eggs', 'wheat'], available: true, sortOrder: 6 },
  { id: 'soup-2', name: 'Wonton Soup', description: 'Handmade pork wontons in clear broth', category: 'soup', pricePerPerson: 4, isSignature: false, dietaryTags: [], allergens: ['wheat', 'soy'], available: true, sortOrder: 7 },
  { id: 'ent-1', name: "General Tso's Chicken", description: 'Our signature crispy chicken in tangy-sweet glaze', category: 'entree', pricePerPerson: 8, isSignature: true, dietaryTags: [], allergens: ['wheat', 'soy', 'eggs'], available: true, sortOrder: 8 },
  { id: 'ent-2', name: 'Mapo Tofu', description: 'Silken tofu in fiery Szechuan peppercorn sauce', category: 'entree', pricePerPerson: 7, isSignature: false, dietaryTags: ['vegetarian', 'spicy', 'gluten-free'], allergens: ['soy'], available: true, sortOrder: 9 },
  { id: 'ent-3', name: 'Mongolian Beef', description: 'Tender flank steak with scallions and soy glaze', category: 'entree', pricePerPerson: 9, isSignature: true, dietaryTags: [], allergens: ['soy', 'wheat'], available: true, sortOrder: 10 },
  { id: 'ent-4', name: 'Kung Pao Shrimp', description: 'Wok-fired with peanuts, peppers, and Szechuan spice', category: 'entree', pricePerPerson: 9, isSignature: false, dietaryTags: ['spicy', 'contains-nuts'], allergens: ['shellfish', 'peanuts', 'soy', 'wheat'], available: true, sortOrder: 11 },
  { id: 'ent-5', name: 'Miso Glazed Black Cod', description: 'Slow-roasted with ginger and bok choy', category: 'entree', pricePerPerson: 12, isSignature: true, dietaryTags: ['gluten-free'], allergens: ['fish', 'soy'], available: true, sortOrder: 12 },
  { id: 'ent-6', name: 'Five-Spice Duck Breast', description: 'Crispy skin, plum sauce, pickled vegetables', category: 'entree', pricePerPerson: 11, isSignature: true, dietaryTags: [], allergens: ['soy', 'wheat'], available: true, sortOrder: 13 },
  { id: 'ent-7', name: 'Braised Eggplant', description: 'With garlic sauce, basil, and crispy shallots', category: 'entree', pricePerPerson: 6, isSignature: false, dietaryTags: ['vegetarian', 'vegan'], allergens: ['soy'], available: true, sortOrder: 14 },
  { id: 'side-1', name: 'Wok-Charred Broccolini', description: 'With oyster sauce and crispy garlic', category: 'side', pricePerPerson: 3, isSignature: false, dietaryTags: ['vegetarian'], allergens: ['soy', 'shellfish'], available: true, sortOrder: 15 },
  { id: 'side-2', name: 'Stir-Fried Green Beans', description: 'Dry-fried with pork mince and chilies', category: 'side', pricePerPerson: 3, isSignature: false, dietaryTags: ['spicy'], allergens: ['soy'], available: true, sortOrder: 16 },
  { id: 'nr-1', name: 'Dan Dan Noodles', description: 'Spicy Szechuan peanut sauce with ground pork', category: 'noodles-rice', pricePerPerson: 5, isSignature: false, dietaryTags: ['spicy', 'contains-nuts'], allergens: ['wheat', 'peanuts', 'soy', 'sesame'], available: true, sortOrder: 17 },
  { id: 'nr-2', name: 'Yangzhou Fried Rice', description: 'Classic egg fried rice with shrimp and BBQ pork', category: 'noodles-rice', pricePerPerson: 4, isSignature: false, dietaryTags: [], allergens: ['eggs', 'shellfish', 'soy'], available: true, sortOrder: 18 },
  { id: 'nr-3', name: 'Lo Mein', description: 'Egg noodles with seasonal vegetables', category: 'noodles-rice', pricePerPerson: 4, isSignature: false, dietaryTags: ['vegetarian'], allergens: ['wheat', 'eggs', 'soy'], available: true, sortOrder: 19 },
  { id: 'nr-4', name: 'Steamed Jasmine Rice', description: 'Fragrant long grain', category: 'noodles-rice', pricePerPerson: 2, isSignature: false, dietaryTags: ['vegetarian', 'vegan', 'gluten-free'], allergens: [], available: true, sortOrder: 20 },
  { id: 'des-1', name: 'Black Sesame Crème Brûlée', description: 'Silky custard with toasted sesame tuile', category: 'dessert', pricePerPerson: 5, isSignature: true, dietaryTags: ['vegetarian'], allergens: ['dairy', 'eggs', 'sesame'], available: true, sortOrder: 21 },
  { id: 'des-2', name: 'Mango Sticky Rice', description: 'Coconut cream, toasted peanuts', category: 'dessert', pricePerPerson: 4, isSignature: false, dietaryTags: ['vegetarian', 'gluten-free', 'contains-nuts'], allergens: ['peanuts', 'tree-nuts'], available: true, sortOrder: 22 },
  { id: 'des-3', name: 'Fried Sesame Balls', description: 'Red bean paste filled, dusted in sugar', category: 'dessert', pricePerPerson: 3, isSignature: false, dietaryTags: ['vegetarian'], allergens: ['wheat', 'sesame', 'soy'], available: true, sortOrder: 23 },
];

const MEAL_PRICING = [
  { type: 'meal', key: 'tasting', label: 'Tasting Menu', description: "A curated multi-course journey through Sum Bar's signature dishes", priceLow: 85, priceHigh: 120, minHeadcount: 20, courses: 6, sortOrder: 1 },
  { type: 'meal', key: 'family-style', label: 'Family Style', description: 'Shared platters for the table — the way Chinese food is meant to be enjoyed', priceLow: 65, priceHigh: 95, minHeadcount: 15, courses: 5, sortOrder: 2 },
  { type: 'meal', key: 'buffet', label: 'Buffet', description: 'An abundant spread with carving stations and live wok cooking', priceLow: 55, priceHigh: 80, minHeadcount: 25, courses: 8, sortOrder: 3 },
  { type: 'meal', key: 'small-bites', label: 'Small Bites', description: 'Cocktail-style passed appetizers and dim sum — perfect for mingling', priceLow: 40, priceHigh: 65, minHeadcount: 15, courses: 6, sortOrder: 4 },
];

const BAR_PRICING = [
  { type: 'bar', key: 'open-bar', label: 'Open Bar', description: 'Full cocktail, wine, and beer service for all guests', priceLow: 35, priceHigh: 55, sortOrder: 1 },
  { type: 'bar', key: 'cash-bar', label: 'Cash Bar', description: 'Guests purchase their own drinks — no additional cost to host', priceLow: 0, priceHigh: 0, sortOrder: 2 },
  { type: 'bar', key: 'pairings', label: 'Curated Pairings', description: 'Sommelier-selected wine and cocktail pairings with each course', priceLow: 25, priceHigh: 40, sortOrder: 3 },
  { type: 'bar', key: 'none', label: 'No Bar', description: 'Non-alcoholic beverages only — tea, soft drinks, and water service', priceLow: 0, priceHigh: 0, sortOrder: 4 },
];

function seed() {
  console.log('Seeding database...');

  // Menu items
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as { count: number };
  if (existingCount.count === 0) {
    const insert = db.prepare(`
      INSERT INTO menu_items (id, name, description, category, price_per_person, is_signature, dietary_tags, allergens, available, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      for (const item of MENU_ITEMS) {
        insert.run(item.id, item.name, item.description, item.category, item.pricePerPerson, item.isSignature ? 1 : 0, JSON.stringify(item.dietaryTags), JSON.stringify(item.allergens), item.available ? 1 : 0, item.sortOrder);
      }
    });
    tx();
    console.log(`  Inserted ${MENU_ITEMS.length} menu items`);
  } else {
    console.log(`  Menu items already seeded (${existingCount.count} rows)`);
  }

  // Pricing tiers
  const pricingCount = db.prepare('SELECT COUNT(*) as count FROM pricing_tiers').get() as { count: number };
  if (pricingCount.count === 0) {
    const insertPricing = db.prepare(`
      INSERT INTO pricing_tiers (type, key, label, description, price_per_person_low, price_per_person_high, minimum_headcount, included_courses, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      for (const m of MEAL_PRICING) {
        insertPricing.run(m.type, m.key, m.label, m.description, m.priceLow, m.priceHigh, m.minHeadcount, m.courses, m.sortOrder);
      }
      for (const b of BAR_PRICING) {
        insertPricing.run(b.type, b.key, b.label, b.description, b.priceLow, b.priceHigh, null, null, b.sortOrder);
      }
    });
    tx();
    console.log(`  Inserted ${MEAL_PRICING.length + BAR_PRICING.length} pricing tiers`);
  } else {
    console.log(`  Pricing tiers already seeded (${pricingCount.count} rows)`);
  }

  // Admin employee
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get() as { count: number };
  if (empCount.count === 0) {
    const password = process.env.ADMIN_PASSWORD || 'sumbar2024';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO employees (username, password_hash, display_name) VALUES (?, ?, ?)').run('admin', hash, 'Admin');
    console.log('  Created admin employee (username: admin)');
  } else {
    console.log(`  Employees already seeded (${empCount.count} rows)`);
  }

  // Site settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    const tx = db.transaction(() => {
      insertSetting.run('buyout_description', 'Reserve the entire restaurant for your private event. Choose from tasting menus, family style, buffet, or small bites with full bar service.');
      insertSetting.run('togo_description', 'Order our signature dishes for pickup. Perfect for office lunches, parties, and celebrations of any size.');
      insertSetting.run('category_labels', JSON.stringify({
        appetizer: 'Appetizers',
        soup: 'Soups',
        entree: 'Entrées',
        side: 'Sides',
        'noodles-rice': 'Noodles & Rice',
        dessert: 'Desserts',
      }));
      insertSetting.run('general_description', 'Have something unique in mind or just want to chat? Reach out to our sales team and we\'ll help bring your vision to life.');
      insertSetting.run('recommended_dishes', JSON.stringify({
        appetizer:      [{ maxHeadcount: 20, count: 2 }, { maxHeadcount: 40, count: 3 }, { maxHeadcount: 80, count: 4 }],
        soup:           [{ maxHeadcount: 40, count: 1 }, { maxHeadcount: 80, count: 2 }],
        entree:         [{ maxHeadcount: 20, count: 2 }, { maxHeadcount: 40, count: 3 }, { maxHeadcount: 60, count: 4 }, { maxHeadcount: 80, count: 5 }],
        side:           [{ maxHeadcount: 20, count: 1 }, { maxHeadcount: 80, count: 2 }],
        'noodles-rice': [{ maxHeadcount: 20, count: 1 }, { maxHeadcount: 80, count: 2 }],
        dessert:        [{ maxHeadcount: 30, count: 1 }, { maxHeadcount: 80, count: 2 }],
      }));
    });
    tx();
    console.log('  Inserted site settings');
  } else {
    console.log(`  Site settings already seeded (${settingsCount.count} rows)`);
  }

  // Rental fees
  const rentalCount = db.prepare('SELECT COUNT(*) as count FROM rental_fees').get() as { count: number };
  if (rentalCount.count === 0) {
    const insertRental = db.prepare('INSERT INTO rental_fees (day_of_week, day_label, fee, sort_order) VALUES (?, ?, ?, ?)');
    const tx = db.transaction(() => {
      insertRental.run(0, 'Sunday',    1500, 0);
      insertRental.run(1, 'Monday',    1000, 1);
      insertRental.run(2, 'Tuesday',   1000, 2);
      insertRental.run(3, 'Wednesday', 1000, 3);
      insertRental.run(4, 'Thursday',  1500, 4);
      insertRental.run(5, 'Friday',    2500, 5);
      insertRental.run(6, 'Saturday',  3000, 6);
    });
    tx();
    console.log('  Inserted 7 rental fee entries');
  } else {
    console.log(`  Rental fees already seeded (${rentalCount.count} rows)`);
  }

  console.log('Seed complete.');
}

seed();
