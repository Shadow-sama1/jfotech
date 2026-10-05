import { PrismaClient } from "@prisma/client";
import NaijaStates from "naija-state-local-government";

const prisma = new PrismaClient();
const imagePool = [
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&w=1000&q=80",
];

const categoryData = [
  { name: "Solar Panels", slug: "solar-panels", description: "High-efficiency solar panels for homes and businesses.", sortOrder: 1 },
  { name: "Inverters", slug: "inverters", description: "Reliable hybrid and off-grid solar inverters.", sortOrder: 2 },
  { name: "Batteries", slug: "batteries", description: "Lithium and deep-cycle energy storage.", sortOrder: 3 },
  { name: "Charge Controllers", slug: "charge-controllers", description: "MPPT and PWM charging protection.", sortOrder: 4 },
  { name: "Accessories", slug: "accessories", description: "Solar cables, protection, and system accessories.", sortOrder: 5 },
  { name: "Complete Systems", slug: "complete-systems", description: "Matched solar bundles for Nigerian homes and businesses.", sortOrder: 6 },
];

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  capacity?: string;
  powerRating?: number;
  voltage?: string;
  warranty: string;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  popularity: number;
  imageIndex: number;
};

const products: SeedProduct[] = [
  { name: "550W Monocrystalline Solar Panel", slug: "550w-monocrystalline-solar-panel", sku: "JFO-PNL-550M", brand: "Canadian Solar", category: "solar-panels", description: "High-output monocrystalline module engineered for dependable generation in demanding climates. Suitable for residential and commercial rooftop or ground-mount arrays.", shortDescription: "High-efficiency 550W mono panel with strong low-light performance.", price: 285000, compareAtPrice: 320000, stock: 26, capacity: "550W", powerRating: 550, voltage: "24V", warranty: "12-year product, 25-year performance", specifications: { CellType: "Monocrystalline PERC", MaxPower: "550W", Voltage: "24V nominal", Efficiency: "21.3%", Frame: "Anodised aluminium" }, isFeatured: true, popularity: 97, imageIndex: 0 },
  { name: "450W Half-Cell Solar Panel", slug: "450w-half-cell-solar-panel", sku: "JFO-PNL-450H", brand: "Jinko Solar", category: "solar-panels", description: "Durable half-cell module with reduced resistive losses and improved shading response for residential rooftops.", shortDescription: "Reliable 450W panel designed for efficient rooftop arrays.", price: 238000, stock: 31, capacity: "450W", powerRating: 450, voltage: "24V", warranty: "12-year product, 25-year performance", specifications: { CellType: "Monocrystalline half-cell", MaxPower: "450W", Voltage: "24V nominal", Frame: "Anodised aluminium" }, popularity: 81, imageIndex: 0 },
  { name: "410W N-Type Solar Panel", slug: "410w-n-type-solar-panel", sku: "JFO-PNL-410N", brand: "JA Solar", category: "solar-panels", description: "N-type module delivers dependable generation, reduced degradation and strong temperature performance.", shortDescription: "Modern N-type panel with durable long-term performance.", price: 220000, stock: 18, capacity: "410W", powerRating: 410, voltage: "24V", warranty: "15-year product, 30-year performance", specifications: { CellType: "N-type monocrystalline", MaxPower: "410W", Voltage: "24V nominal", Degradation: "Low annual degradation" }, popularity: 73, imageIndex: 0 },
  { name: "330W Poly Solar Panel", slug: "330w-poly-solar-panel", sku: "JFO-PNL-330P", brand: "Trina Solar", category: "solar-panels", description: "Cost-effective module for smaller systems and budget-conscious projects.", shortDescription: "Practical 330W panel for starter solar systems.", price: 168000, stock: 40, capacity: "330W", powerRating: 330, voltage: "24V", warranty: "10-year product, 25-year performance", specifications: { CellType: "Polycrystalline", MaxPower: "330W", Voltage: "24V nominal" }, popularity: 58, imageIndex: 1 },
  { name: "5kVA 48V Hybrid Inverter", slug: "5kva-48v-hybrid-inverter", sku: "JFO-INV-5K48", brand: "Luminous", category: "inverters", description: "Hybrid inverter for homes and small businesses. Combines solar, battery, and grid input with configurable charging priorities and built-in protection.", shortDescription: "Whole-home hybrid power with solar, battery and grid input.", price: 1250000, compareAtPrice: 1400000, stock: 12, capacity: "5kVA", powerRating: 5000, voltage: "48V", warranty: "2 years", specifications: { RatedPower: "5kVA / 5kW", Battery: "48V DC", Waveform: "Pure sine wave", MPPT: "Integrated solar charger", Protection: "Overload, short-circuit, over-temperature" }, isFeatured: true, popularity: 99, imageIndex: 1 },
  { name: "3.5kVA 24V Hybrid Inverter", slug: "3-5kva-24v-hybrid-inverter", sku: "JFO-INV-35K24", brand: "Sako", category: "inverters", description: "Compact hybrid inverter for apartments and essential-load systems, with pure sine wave output and integrated MPPT charging.", shortDescription: "Compact hybrid backup for essential home appliances.", price: 735000, stock: 15, capacity: "3.5kVA", powerRating: 3500, voltage: "24V", warranty: "2 years", specifications: { RatedPower: "3.5kVA", Battery: "24V DC", Waveform: "Pure sine wave", Charger: "Integrated MPPT" }, popularity: 88, imageIndex: 1 },
  { name: "10kVA 48V Three-Phase Inverter", slug: "10kva-48v-three-phase-inverter", sku: "JFO-INV-10K3P", brand: "Deye", category: "inverters", description: "Three-phase hybrid inverter suited to larger homes and commercial sites, with flexible PV input and remote monitoring support.", shortDescription: "High-capacity three-phase hybrid power for demanding loads.", price: 3450000, stock: 5, capacity: "10kVA", powerRating: 10000, voltage: "48V", warranty: "5 years", specifications: { RatedPower: "10kW", Phases: "Three-phase", Battery: "48V", Monitoring: "Wi-Fi supported", Protection: "IP65 enclosure" }, popularity: 65, imageIndex: 1 },
  { name: "1.5kVA 12V Pure Sine Inverter", slug: "1-5kva-12v-pure-sine-inverter", sku: "JFO-INV-15K12", brand: "Mercury", category: "inverters", description: "Entry-level pure sine wave inverter for lights, television, router, and other essential loads.", shortDescription: "A dependable starter inverter for everyday essentials.", price: 285000, stock: 23, capacity: "1.5kVA", powerRating: 1500, voltage: "12V", warranty: "1 year", specifications: { RatedPower: "1.5kVA", Battery: "12V", Waveform: "Pure sine wave", Display: "LCD status display" }, popularity: 74, imageIndex: 1 },
  { name: "5.12kWh LiFePO4 Wall Battery", slug: "5-12kwh-lifepo4-wall-battery", sku: "JFO-BAT-512L", brand: "Felicity Solar", category: "batteries", description: "Wall-mounted lithium iron phosphate battery with battery management protection and scalable parallel operation.", shortDescription: "Long-life 5.12kWh lithium storage for home solar.", price: 1850000, stock: 9, capacity: "5.12kWh", voltage: "51.2V", warranty: "5 years", specifications: { Chemistry: "LiFePO4", Energy: "5.12kWh", Voltage: "51.2V", CycleLife: "6000+ cycles", BMS: "Integrated" }, isFeatured: true, popularity: 98, imageIndex: 2 },
  { name: "2.56kWh LiFePO4 Battery", slug: "2-56kwh-lifepo4-battery", sku: "JFO-BAT-256L", brand: "Pylontech", category: "batteries", description: "Modular lithium storage with CAN/RS485 communication and proven compatibility with popular hybrid inverters.", shortDescription: "Expandable 2.56kWh lithium battery module.", price: 1125000, stock: 11, capacity: "2.56kWh", voltage: "48V", warranty: "5 years", specifications: { Chemistry: "LiFePO4", Energy: "2.56kWh", Voltage: "48V", Communication: "CAN / RS485" }, popularity: 84, imageIndex: 2 },
  { name: "200Ah 12V Deep-Cycle Gel Battery", slug: "200ah-12v-deep-cycle-gel-battery", sku: "JFO-BAT-200G", brand: "Ritar", category: "batteries", description: "Maintenance-free deep-cycle gel battery for compact backup and off-grid applications.", shortDescription: "Durable 200Ah gel battery for reliable backup storage.", price: 495000, stock: 20, capacity: "200Ah", voltage: "12V", warranty: "1 year", specifications: { Chemistry: "Gel lead-acid", Capacity: "200Ah", Voltage: "12V", Maintenance: "Sealed, maintenance-free" }, popularity: 62, imageIndex: 2 },
  { name: "100Ah 12V AGM Battery", slug: "100ah-12v-agm-battery", sku: "JFO-BAT-100A", brand: "BlueNova", category: "batteries", description: "Sealed AGM battery for entry-level inverter backup and small standalone applications.", shortDescription: "Simple, sealed 100Ah battery for compact backup systems.", price: 285000, stock: 28, capacity: "100Ah", voltage: "12V", warranty: "1 year", specifications: { Chemistry: "AGM lead-acid", Capacity: "100Ah", Voltage: "12V", Maintenance: "Sealed" }, popularity: 57, imageIndex: 2 },
  { name: "100A MPPT Solar Charge Controller", slug: "100a-mppt-solar-charge-controller", sku: "JFO-CC-100M", brand: "Victron Energy", category: "charge-controllers", description: "High-efficiency MPPT controller that extracts more energy from PV arrays and protects battery health with configurable charging profiles.", shortDescription: "Advanced 100A MPPT charging for larger solar arrays.", price: 385000, compareAtPrice: 420000, stock: 14, capacity: "100A", powerRating: 100, voltage: "12/24/48V", warranty: "5 years", specifications: { Type: "MPPT", Current: "100A", Battery: "12 / 24 / 48V auto-select", Connectivity: "Bluetooth monitoring" }, isFeatured: true, popularity: 92, imageIndex: 1 },
  { name: "60A MPPT Solar Charge Controller", slug: "60a-mppt-solar-charge-controller", sku: "JFO-CC-060M", brand: "Epever", category: "charge-controllers", description: "Efficient controller for mid-sized residential arrays with clear status display and multi-stage charging.", shortDescription: "Versatile 60A MPPT controller for residential systems.", price: 245000, stock: 17, capacity: "60A", powerRating: 60, voltage: "12/24V", warranty: "2 years", specifications: { Type: "MPPT", Current: "60A", Battery: "12 / 24V auto-select", Display: "LCD" }, popularity: 79, imageIndex: 1 },
  { name: "40A PWM Charge Controller", slug: "40a-pwm-charge-controller", sku: "JFO-CC-040P", brand: "Must", category: "charge-controllers", description: "Straightforward PWM controller for smaller and budget-focused solar installations.", shortDescription: "Cost-effective 40A controller for smaller PV setups.", price: 58000, stock: 35, capacity: "40A", powerRating: 40, voltage: "12/24V", warranty: "1 year", specifications: { Type: "PWM", Current: "40A", Battery: "12 / 24V", Display: "LCD" }, popularity: 54, imageIndex: 1 },
  { name: "6mm² Solar Cable Pair, 10m", slug: "6mm-solar-cable-pair-10m", sku: "JFO-ACC-CBL6-10", brand: "Generic", category: "accessories", description: "UV-resistant twin-core solar cable pair for PV string connections, supplied ready for installation.", shortDescription: "Weather-resistant 6mm² cable pair for solar array wiring.", price: 45000, stock: 50, capacity: "10m pair", voltage: "1500V DC", warranty: "1 year", specifications: { Gauge: "6mm²", Length: "10m pair", Jacket: "UV-resistant", Rating: "1500V DC" }, popularity: 51, imageIndex: 0 },
  { name: "1000V DC Solar Protection Kit", slug: "1000v-dc-solar-protection-kit", sku: "JFO-ACC-PROT1K", brand: "Schneider Electric", category: "accessories", description: "Protection kit with DC isolator and surge protection components for solar PV input.", shortDescription: "Essential DC isolation and surge protection components.", price: 165000, stock: 16, voltage: "1000V DC", warranty: "2 years", specifications: { DCIsolator: "Included", SurgeProtection: "Type 2", Rating: "1000V DC", Enclosure: "Weather resistant" }, popularity: 66, imageIndex: 0 },
  { name: "Pair of MC4 Solar Connectors", slug: "pair-mc4-solar-connectors", sku: "JFO-ACC-MC4", brand: "Stäubli", category: "accessories", description: "Locking PV connectors for secure and weather-resistant solar string connections.", shortDescription: "Durable, weather-resistant connectors for PV wiring.", price: 12500, stock: 80, voltage: "1500V DC", warranty: "1 year", specifications: { Connector: "MC4 compatible", Rating: "1500V DC", Protection: "IP68", Quantity: "Pair" }, popularity: 61, imageIndex: 0 },
  { name: "5kVA Home Solar Starter Bundle", slug: "5kva-home-solar-starter-bundle", sku: "JFO-BND-HOME5", brand: "JFO Tech", category: "complete-systems", description: "A matched starter system with a 5kVA hybrid inverter, high-output solar panels, lithium storage, and essential protection components. Final design should be confirmed against household load and site conditions.", shortDescription: "Matched hybrid solar starter bundle for an average home.", price: 4850000, compareAtPrice: 5250000, stock: 6, capacity: "5.12kWh storage", powerRating: 5000, voltage: "48V", warranty: "Manufacturer warranty by component", specifications: { Inverter: "5kVA hybrid", Panels: "4 x 550W", Battery: "5.12kWh LiFePO4", Includes: "Protection kit and cabling", Installation: "Quote separately" }, isFeatured: true, popularity: 100, imageIndex: 0 },
  { name: "3.5kVA Apartment Solar Bundle", slug: "3-5kva-apartment-solar-bundle", sku: "JFO-BND-APT35", brand: "JFO Tech", category: "complete-systems", description: "Compact system bundle for apartment essentials such as lighting, fans, television, and connectivity. Confirm appliance loads with an installer before purchase.", shortDescription: "Right-sized hybrid bundle for apartment essentials.", price: 2750000, stock: 8, capacity: "2.56kWh storage", powerRating: 3500, voltage: "24V", warranty: "Manufacturer warranty by component", specifications: { Inverter: "3.5kVA hybrid", Panels: "3 x 450W", Battery: "2.56kWh LiFePO4", Includes: "Mounting and protection components", Installation: "Quote separately" }, isFeatured: true, popularity: 94, imageIndex: 0 },
  { name: "10kVA Business Solar Bundle", slug: "10kva-business-solar-bundle", sku: "JFO-BND-BIZ10", brand: "JFO Tech", category: "complete-systems", description: "Higher-capacity hybrid bundle for shops and small commercial premises with scalable energy storage. Site survey and load assessment are required before installation.", shortDescription: "Scalable solar power bundle for small businesses.", price: 9850000, stock: 3, capacity: "10.24kWh storage", powerRating: 10000, voltage: "48V", warranty: "Manufacturer warranty by component", specifications: { Inverter: "10kVA hybrid", Panels: "8 x 550W", Battery: "10.24kWh LiFePO4", Monitoring: "Remote monitoring", Installation: "Quote separately" }, isFeatured: true, popularity: 89, imageIndex: 1 },
  { name: "1.5kVA Essential Backup Bundle", slug: "1-5kva-essential-backup-bundle", sku: "JFO-BND-ESS15", brand: "JFO Tech", category: "complete-systems", description: "Entry-level inverter and battery bundle for lighting, Wi-Fi, television, and other essential loads during outages.", shortDescription: "Affordable power backup for the most important essentials.", price: 895000, stock: 10, capacity: "100Ah storage", powerRating: 1500, voltage: "12V", warranty: "Manufacturer warranty by component", specifications: { Inverter: "1.5kVA pure sine", Battery: "100Ah AGM", Includes: "Basic cabling and protection", Installation: "Quote separately" }, popularity: 77, imageIndex: 1 },
];

async function main() {
  const categories = new Map<string, string>();
  for (const category of categoryData) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, create: category, update: category });
    categories.set(category.slug, saved.id);
  }

  const stateFees: Record<string, number> = {
    Lagos: 7500, Ogun: 10000, Oyo: 12000, Osun: 14000, Ondo: 16000, Ekiti: 16000,
    "Federal Capital Territory": 18000, Kaduna: 22000, Kano: 24000, Rivers: 22000,
    Delta: 19000, Edo: 18000, Enugu: 22000, Anambra: 22000, Imo: 22000,
    Abia: 22000, Akwa_Ibom: 24000, Cross_River: 26000, Bayelsa: 26000,
    Borno: 35000, Yobe: 35000, Adamawa: 32000, Taraba: 32000, Gombe: 30000,
    Bauchi: 28000, Jigawa: 27000, Katsina: 27000, Kebbi: 30000, Sokoto: 30000,
    Zamfara: 29000, Niger: 22000, Kogi: 18000, Benue: 23000, Nasarawa: 19000,
    Plateau: 25000, Ebonyi: 23000, "Kwara": 16000,
  };
  for (const state of NaijaStates.states()) {
    const normalized = state.replaceAll("_", " ");
    const fee = stateFees[state] ?? stateFees[normalized] ?? 22000;
    await prisma.deliveryZone.upsert({ where: { state: normalized }, create: { state: normalized, fee }, update: { fee, isActive: true } });
  }
  await prisma.coupon.upsert({
    where: { code: "JFOSOLAR5" },
    create: { code: "JFOSOLAR5", type: "PERCENTAGE", value: 5, minimumSubtotal: 500000, maxDiscount: 150000, isActive: true },
    update: { type: "PERCENTAGE", value: 5, minimumSubtotal: 500000, maxDiscount: 150000, isActive: true },
  });

  for (const product of products) {
    const { category, imageIndex, ...data } = product;
    const productId = (await prisma.product.upsert({
      where: { slug: data.slug },
      create: {
        ...data,
        categoryId: categories.get(category)!,
        isPublished: true,
        installationEligible: ["inverters", "batteries", "complete-systems"].includes(category),
        installationFee: category === "complete-systems" ? 180000 : ["inverters", "batteries"].includes(category) ? 85000 : 0,
      },
      update: {
        ...data,
        categoryId: categories.get(category)!,
        isPublished: true,
        installationEligible: ["inverters", "batteries", "complete-systems"].includes(category),
        installationFee: category === "complete-systems" ? 180000 : ["inverters", "batteries"].includes(category) ? 85000 : 0,
      },
    })).id;
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.productImage.create({
      data: {
        productId,
        url: imagePool[imageIndex],
        alt: data.name,
        sortOrder: 0,
      },
    });
  }

  console.info(`Seeded ${categoryData.length} categories and ${products.length} products.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());