import { PrismaClient, Role, RestaurantStatus, OrderStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing records in proper dependency order
  console.log("🧹 Clearing old data...");
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.menuItemOption.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.operatingHours.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Shared development password: "password123"
  const defaultPassword = await bcrypt.hash("password123", 10);

  // ─── 1. CREATE USERS ────────────────────────────────────
  console.log("👤 Creating users...");

  // Platform Admin
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@feasthub.com",
      hashedPassword: defaultPassword,
      name: "Alex Administrator",
      phone: "+1-555-0100",
      role: Role.ADMIN,
    },
  });

  // Restaurant Owners
  const owner1 = await prisma.user.create({
    data: {
      email: "mario@luigispizza.com",
      hashedPassword: defaultPassword,
      name: "Mario Rossi",
      phone: "+1-555-0201",
      role: Role.OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "kenji@tokyoramen.com",
      hashedPassword: defaultPassword,
      name: "Kenji Sato",
      phone: "+1-555-0202",
      role: Role.OWNER,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      email: "carlos@tacofiesta.com",
      hashedPassword: defaultPassword,
      name: "Carlos Rodriguez",
      phone: "+1-555-0203",
      role: Role.OWNER,
    },
  });

  // Nepalese Restaurant Owners
  const ownerPasang = await prisma.user.create({
    data: {
      email: "pasang@himalayanmomo.com",
      hashedPassword: defaultPassword,
      name: "Pasang Sherpa",
      phone: "+1-555-0205",
      role: Role.OWNER,
    },
  });

  const ownerBinod = await prisma.user.create({
    data: {
      email: "binod@thakalikitchen.com",
      hashedPassword: defaultPassword,
      name: "Binod Thakali",
      phone: "+1-555-0206",
      role: Role.OWNER,
    },
  });

  const owner4 = await prisma.user.create({
    data: {
      email: "chen@goldendragon.com",
      hashedPassword: defaultPassword,
      name: "Master Chen",
      phone: "+1-555-0204",
      role: Role.OWNER,
    },
  });

  // Customers
  const customerAlice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      hashedPassword: defaultPassword,
      name: "Alice Walker",
      phone: "+1-555-0301",
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            label: "Home",
            street: "Thamel Marg, Ward 29",
            city: "Kathmandu",
            state: "Bagmati",
            zipCode: "44600",
            isDefault: true,
          },
          {
            label: "Office",
            street: "Durbar Marg, Ward 31",
            city: "Kathmandu",
            state: "Bagmati",
            zipCode: "44600",
            isDefault: false,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  const customerBob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      hashedPassword: defaultPassword,
      name: "Bob Jenkins",
      phone: "+1-555-0302",
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            label: "Apartment",
            street: "New Baneshwor, Apt 3B",
            city: "Kathmandu",
            state: "Bagmati",
            zipCode: "44600",
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  const customerCharlie = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      hashedPassword: defaultPassword,
      name: "Charlie Kim",
      phone: "+1-555-0303",
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            label: "Home",
            street: "Lazimpat Road, Ward 3",
            city: "Kathmandu",
            state: "Bagmati",
            zipCode: "44600",
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  // ─── 2. CREATE CATEGORIES ───────────────────────────────
  console.log("🥗 Creating categories...");

  const catNepalese = await prisma.category.create({
    data: {
      name: "Nepalese & Himalayan",
      slug: "nepalese-himalayan",
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
    },
  });

  const catMomo = await prisma.category.create({
    data: {
      name: "Momo & Dumplings",
      slug: "momo-dumplings",
      image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600",
    },
  });

  const catThakali = await prisma.category.create({
    data: {
      name: "Thakali Thali & Khaja",
      slug: "thakali-thali",
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600",
    },
  });

  const catItalian = await prisma.category.create({
    data: { name: "Italian & Pizza", slug: "italian-pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600" },
  });
  const catJapanese = await prisma.category.create({
    data: { name: "Japanese & Ramen", slug: "japanese-ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600" },
  });
  const catMexican = await prisma.category.create({
    data: { name: "Mexican & Tacos", slug: "mexican-tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600" },
  });
  const catChinese = await prisma.category.create({
    data: { name: "Chinese & Wok", slug: "chinese-wok", image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600" },
  });

  // ─── 3. CREATE RESTAURANTS ──────────────────────────────
  console.log("🥟 Creating restaurants & menus...");

  // Helper for operating hours (7 days a week, 11:00 to 22:00)
  const defaultHours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    dayOfWeek: day,
    openTime: "11:00",
    closeTime: "22:00",
    isClosed: false,
  }));

  // Restaurant 1: Himalayan Momo & Sekuwa Corner (APPROVED - NEPALESE)
  const restNepalese1 = await prisma.restaurant.create({
    data: {
      ownerId: ownerPasang.id,
      name: "Himalayan Momo & Sekuwa Corner",
      slug: "himalayan-momo-sekuwa-corner",
      description: "Authentic Himalayan handcrafted Momos with spicy Timur tomato achar, charcoal-grilled Sekuwa, and fiery Newari Choila.",
      image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800",
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200",
      phone: "+1-555-1105",
      email: "namaste@himalayanmomo.com",
      street: "Jhamsikhel Road, Ward 3",
      city: "Lalitpur",
      state: "Bagmati",
      zipCode: "44700",
      minOrderAmount: 300,
      deliveryFee: 100,
      avgDeliveryMin: 25,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      categories: { connect: [{ id: catNepalese.id }, { id: catMomo.id }] },
      operatingHours: { create: defaultHours },
      menuItems: {
        create: [
          {
            name: "Authentic Steamed Buff Momo (10 pcs)",
            description: "Hand-folded dumplings filled with minced water buffalo meat, Himalayan wild Timur pepper, garlic, ginger, and fresh cilantro, served with house spicy roasted tomato-sesame achar.",
            price: 350,
            category: "Momo Specialties",
            image: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600",
            options: {
              create: [
                { name: "Extra Timur Dalle Achar (Spicy)", price: 50 },
                { name: "Crispy Fried Style", price: 40 },
                { name: "Cheese Topping", price: 80 },
              ],
            },
          },
          {
            name: "Signature Jhol Chicken Momo (10 pcs)",
            description: "Steamed chicken dumplings bathed in a hot, fragrant, tangy roasted soybean, peanut, and sesame broth (Jhol).",
            price: 380,
            category: "Momo Specialties",
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
            options: {
              create: [
                { name: "Extra Jhol Broth Bowl", price: 80 },
                { name: "Spicy Level: Hot (Dalle Khursani)", price: 30 },
              ],
            },
          },
          {
            name: "Crispy Kothey Pork Momo (10 pcs)",
            description: "Pan-seared half-steamed, half-crispy bottom pork dumplings flavored with chives, scallions, and ginger.",
            price: 370,
            category: "Momo Specialties",
            image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600",
          },
          {
            name: "Himalayan Charcoal Grilled Khasi Sekuwa",
            description: "Tender goat meat skewered and charcoal-grilled over open flames, marinated in mustard oil, roasted cumin, and Himalayan spices. Served with baji (puffed rice) and radish pickle.",
            price: 500,
            category: "Sekuwa & Grills",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
            options: {
              create: [
                { name: "Extra Baji (Puffed Rice)", price: 50 },
                { name: "Roasted Bhatmas (Soybeans)", price: 60 },
              ],
            },
          },
          {
            name: "Spicy Smoked Chicken Choila",
            description: "Charred marinated chicken seasoned with roasted fenugreek (methi), raw mustard oil, garlic flakes, and fresh mountain chillies.",
            price: 320,
            category: "Sekuwa & Grills",
            image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600",
          },
          {
            name: "Traditional Sweet Yomari & Butter Tea",
            description: "Two steamed rice-flour dumplings filled with sweet molten Chaku (jaggery & sesame molasses) and shredded coconut, paired with hot savory Su-Jia Yak Butter Tea.",
            price: 250,
            category: "Desserts & Tea",
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
          },
        ],
      },
    },
    include: { menuItems: { include: { options: true } } },
  });

  // Restaurant 2: Mustang Thakali Kitchen & Khaja Ghar (APPROVED - NEPALESE)
  const restNepalese2 = await prisma.restaurant.create({
    data: {
      ownerId: ownerBinod.id,
      name: "Mustang Thakali Kitchen & Khaja Ghar",
      slug: "mustang-thakali-kitchen",
      description: "Authentic Mustang Thakali Thali sets with Jimbu-tempered black lentils, slow-simmered Himalayan goat curry, fermented Gundruk, and artisanal buckwheat breads.",
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
      phone: "+1-555-1106",
      email: "namaste@mustangthakali.com",
      street: "Naxal Road, Ward 2",
      city: "Kathmandu",
      state: "Bagmati",
      zipCode: "44600",
      minOrderAmount: 400,
      deliveryFee: 120,
      avgDeliveryMin: 30,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      categories: { connect: [{ id: catNepalese.id }, { id: catThakali.id }] },
      operatingHours: { create: defaultHours },
      menuItems: {
        create: [
          {
            name: "Royal Khasi (Goat) Thakali Thali Set",
            description: "Complete traditional Thakali platter featuring tender Himalayan goat curry (Khasi ko Masu), Jimbu-infused black lentils (Kalo Daal), steamed Basmati rice with pure ghee, Rayo ko Saag, Gundruk Bhatmas Achar, Aloo Karela fry, Mula ko Achar, and crispy Papad.",
            price: 550,
            category: "Thakali Thali Sets",
            image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600",
            options: {
              create: [
                { name: "Extra Ghee Bowl", price: 60 },
                { name: "Add Sweet Lalmohan (Gulab Jamun)", price: 80 },
                { name: "Substitute Buckwheat Dhindo (Fapar)", price: 100 },
              ],
            },
          },
          {
            name: "Himalayan Kukhura (Chicken) Thali Set",
            description: "Free-range country chicken curry simmered in freshly stone-ground spices, served with fragrant rice, Jimbu Daal, sauteed spinach, Gundruk pickle, and roasted tomato chutney.",
            price: 450,
            category: "Thakali Thali Sets",
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
          },
          {
            name: "Traditional Sel Roti & Aloo Achar (3 pcs)",
            description: "Golden, crispy, ring-shaped sweet rice-flour bread freshly fried and paired with tangy spiced potato-sesame achar.",
            price: 180,
            category: "Khaja & Appetizers",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
          },
          {
            name: "Aloo Tama Bodi Mountain Soup",
            description: "Classic hearty Newari/Himalayan soup made with fermented bamboo shoots (Tama), black-eyed beans (Bodi), potatoes, garlic, and wild herbs.",
            price: 220,
            category: "Khaja & Appetizers",
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
          },
          {
            name: "Artisanal Yak Cheese Platter & Wild Honey",
            description: "Organic aged Yak cheese from Langtang Valley sliced thin, accompanied by roasted walnuts, dried apples, and wild Himalayan honey.",
            price: 350,
            category: "Desserts & Tea",
            image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600",
          },
        ],
      },
    },
    include: { menuItems: { include: { options: true } } },
  });

  // Restaurant 3: Luigi's Artisanal Pizza (APPROVED)
  const rest1 = await prisma.restaurant.create({
    data: {
      ownerId: owner1.id,
      name: "Luigi's Artisanal Pizza",
      slug: "luigis-artisanal-pizza",
      description: "Authentic Neapolitan wood-fired pizzas handcrafted with imported San Marzano tomatoes and fior di latte mozzarella.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200",
      phone: "+1-555-1101",
      email: "info@luigispizza.com",
      street: "Kumaripati Road, Ward 15",
      city: "Lalitpur",
      state: "Bagmati",
      zipCode: "44700",
      minOrderAmount: 500,
      deliveryFee: 150,
      avgDeliveryMin: 25,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      categories: { connect: [{ id: catItalian.id }] },
      operatingHours: { create: defaultHours },
      menuItems: {
        create: [
          {
            name: "Margherita D.O.P.",
            description: "San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and extra virgin olive oil.",
            price: 850,
            category: "Classic Pizzas",
            image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600",
            options: {
              create: [
                { name: "Extra Fresh Mozzarella", price: 120 },
                { name: "Gluten-Free Crust", price: 180 },
              ],
            },
          },
          {
            name: "Diavola Spicy Salami",
            description: "Spicy Calabrian soppressata, chili flakes, organic tomato sauce, and smoked provolone.",
            price: 950,
            category: "Classic Pizzas",
            image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600",
            options: {
              create: [
                { name: "Hot Honey Drizzle", price: 80 },
                { name: "Double Salami", price: 200 },
              ],
            },
          },
          {
            name: "Truffle & Wild Mushroom",
            description: "Cremini and shiitake mushrooms, white truffle cream, fontina cheese, and fresh thyme.",
            price: 1100,
            category: "Specialty Pizzas",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
          },
        ],
      },
    },
    include: { menuItems: { include: { options: true } } },
  });

  // Restaurant 4: Tokyo Ramen & Izakaya (APPROVED)
  const rest2 = await prisma.restaurant.create({
    data: {
      ownerId: owner2.id,
      name: "Tokyo Ramen & Izakaya",
      slug: "tokyo-ramen-izakaya",
      description: "Rich, 18-hour simmered Tonkotsu broth, artisanal handmade noodles, and savory Japanese izakaya bites.",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
      coverImage: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=1200",
      phone: "+1-555-1102",
      email: "contact@tokyoramen.com",
      street: "Boudhanath Stupa Road, Ward 6",
      city: "Kathmandu",
      state: "Bagmati",
      zipCode: "44602",
      minOrderAmount: 400,
      deliveryFee: 130,
      avgDeliveryMin: 30,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      categories: { connect: [{ id: catJapanese.id }] },
      operatingHours: { create: defaultHours },
      menuItems: {
        create: [
          {
            name: "Signature Tonkotsu Ramen",
            description: "Rich pork bone broth, slow-braised chashu pork belly, ajitsuke tamago egg, menma, and nori.",
            price: 650,
            category: "Ramen Bowls",
            image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
            options: {
              create: [
                { name: "Extra Chashu (2 pcs)", price: 200 },
                { name: "Spicy Garlic Bomb", price: 80 },
              ],
            },
          },
          {
            name: "Pan-Fried Pork Gyoza (6 pcs)",
            description: "Crispy-bottom dumplings filled with seasoned Kurobuta pork, scallions, and ginger ponzu sauce.",
            price: 300,
            category: "Izakaya Bites",
            image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600",
          },
        ],
      },
    },
    include: { menuItems: { include: { options: true } } },
  });

  // Restaurant 5: Taqueria La Fiesta (APPROVED)
  const rest3 = await prisma.restaurant.create({
    data: {
      ownerId: owner3.id,
      name: "Taqueria La Fiesta",
      slug: "taqueria-la-fiesta",
      description: "Authentic street tacos, house-pressed heirloom corn tortillas, slow-roasted birria, and vibrant salsas.",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
      coverImage: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=1200",
      phone: "+1-555-1103",
      email: "hola@tacofiesta.com",
      street: "Patan Durbar Square, Ward 18",
      city: "Lalitpur",
      state: "Bagmati",
      zipCode: "44700",
      minOrderAmount: 250,
      deliveryFee: 80,
      avgDeliveryMin: 20,
      status: RestaurantStatus.APPROVED,
      isActive: true,
      categories: { connect: [{ id: catMexican.id }] },
      operatingHours: { create: defaultHours },
      menuItems: {
        create: [
          {
            name: "Birria Quesatacos Trio",
            description: "Crispy beef birria tacos with melted Oaxaca cheese, cilantro, onions, and rich dipping consommé.",
            price: 520,
            category: "Tacos & Mains",
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
            options: {
              create: [
                { name: "Extra Consommé Cup", price: 80 },
                { name: "Add Guacamole", price: 120 },
              ],
            },
          },
        ],
      },
    },
    include: { menuItems: { include: { options: true } } },
  });

  // Restaurant 6: The Golden Dragon Wok (PENDING approval — for admin testing)
  await prisma.restaurant.create({
    data: {
      ownerId: owner4.id,
      name: "The Golden Dragon Wok",
      slug: "the-golden-dragon-wok",
      description: "Sizzling wok stir-fries, crispy Peking duck, and handmade dim sum specialties.",
      image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800",
      phone: "+1-555-1104",
      email: "hello@goldendragon.com",
      street: "Basantapur, Ward 25",
      city: "Kathmandu",
      state: "Bagmati",
      zipCode: "44600",
      minOrderAmount: 500,
      deliveryFee: 140,
      avgDeliveryMin: 35,
      status: RestaurantStatus.PENDING,
      isActive: false,
      categories: { connect: [{ id: catChinese.id }] },
      operatingHours: { create: defaultHours },
    },
  });

  // ─── 4. CREATE SAMPLE ORDERS & ORDER ITEMS ──────────────
  console.log("📦 Creating sample orders across lifecycle...");

  const momoDish1 = restNepalese1.menuItems[0]; // Buff Momo
  const momoDish2 = restNepalese1.menuItems[1]; // Jhol Momo
  const thaliDish1 = restNepalese2.menuItems[0]; // Royal Khasi Thali

  // Order 1: DELIVERED (Alice ordered from Himalayan Momo Corner)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260816-M101",
      userId: customerAlice.id,
      restaurantId: restNepalese1.id,
      addressId: customerAlice.addresses[0].id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CARD,
      subtotal: 730,
      deliveryFee: 100,
      tax: 94.90,
      total: 924.90,
      specialNotes: "Please make the momo jhol extra spicy!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      items: {
        create: [
          {
            menuItemId: momoDish1.id,
            name: momoDish1.name,
            price: momoDish1.price,
            quantity: 1,
            options: [{ id: "opt-1", name: "Extra Timur Dalle Achar", price: 50 }],
          },
          {
            menuItemId: momoDish2.id,
            name: momoDish2.name,
            price: momoDish2.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Order 2: DELIVERED (Bob ordered from Mustang Thakali)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-20260816-T202",
      userId: customerBob.id,
      restaurantId: restNepalese2.id,
      addressId: customerBob.addresses[0].id,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      subtotal: 550,
      deliveryFee: 120,
      tax: 71.50,
      total: 741.50,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      items: {
        create: [
          {
            menuItemId: thaliDish1.id,
            name: thaliDish1.name,
            price: thaliDish1.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  // ─── 5. CREATE REVIEWS & REPLIES ─────────────────────────
  console.log("⭐ Creating verified customer reviews...");

  // Review for Order 1 (Alice on Himalayan Momo Corner)
  await prisma.review.create({
    data: {
      userId: customerAlice.id,
      restaurantId: restNepalese1.id,
      orderId: order1.id,
      rating: 5,
      comment: "Dami cha! The best authentic Steamed Buff Momo and Jhol Momo in town. The timur achar has that authentic Himalayan numbing kick!",
      reply: {
        create: {
          content: "Dhanyabad Alice ji! We freshly grind our Timur and spices directly from Nepal. Glad you loved the jhol!",
        },
      },
    },
  });

  // Review for Order 2 (Bob on Mustang Thakali)
  await prisma.review.create({
    data: {
      userId: customerBob.id,
      restaurantId: restNepalese2.id,
      orderId: order2.id,
      rating: 5,
      comment: "The Khasi ko Masu and Jimbu Kalo Daal tasted just like eating in Pokhara or Mustang. Incredible flavors and generous portions.",
    },
  });

  console.log("✅ Seed completed successfully with Nepalese cuisines & test accounts!");
  console.log("\n📋 Sample Development Accounts:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Password for ALL accounts: password123");
  console.log("───────────────────────────────────────────────────────────────────");
  console.log("👑 ADMIN:        admin@feasthub.com");
  console.log("🥟 NEPALESE 1:   pasang@himalayanmomo.com (Himalayan Momo & Sekuwa)");
  console.log("🍲 NEPALESE 2:   binod@thakalikitchen.com (Mustang Thakali Kitchen)");
  console.log("🍕 OWNER 3:      mario@luigispizza.com    (Luigi's Artisanal Pizza)");
  console.log("🍜 OWNER 4:      kenji@tokyoramen.com     (Tokyo Ramen & Izakaya)");
  console.log("🌮 OWNER 5:      carlos@tacofiesta.com    (Taqueria La Fiesta)");
  console.log("👤 CUSTOMER 1:   alice@example.com");
  console.log("👤 CUSTOMER 2:   bob@example.com");
  console.log("👤 CUSTOMER 3:   charlie@example.com");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
