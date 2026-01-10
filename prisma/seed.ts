import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create PostgreSQL Pool for seeding (works with Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const defaultCategories = [
  // INCOME CATEGORIES
  {
    key: 'SALARY',
    name: 'Salario',
    icon: 'Briefcase',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'FREELANCE',
    name: 'Trabajo Independiente',
    icon: 'Laptop',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'INVESTMENT_INCOME',
    name: 'Rendimientos',
    icon: 'TrendingUp',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'REFUND',
    name: 'Devoluciones',
    icon: 'RefreshCcw',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'GIFT_INCOME',
    name: 'Regalos Recibidos',
    icon: 'Gift',
    color: 'financial-positive',
    type: 'INCOME',
  },
  {
    key: 'OTHER_INCOME',
    name: 'Otros Ingresos',
    icon: 'Plus',
    color: 'financial-positive',
    type: 'INCOME',
  },

  // FOOD & GROCERIES
  {
    key: 'GROCERIES',
    name: 'Mercado',
    icon: 'ShoppingCart',
    color: 'category-food',
    type: 'EXPENSE',
  },
  {
    key: 'RESTAURANTS',
    name: 'Restaurantes',
    icon: 'UtensilsCrossed',
    color: 'category-food',
    type: 'EXPENSE',
  },
  {
    key: 'COFFEE_SNACKS',
    name: 'Café y Meriendas',
    icon: 'Coffee',
    color: 'category-food',
    type: 'EXPENSE',
  },

  // TRANSPORTATION
  {
    key: 'PUBLIC_TRANSPORT',
    name: 'Transporte Público',
    icon: 'Bus',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'TAXI_UBER',
    name: 'Taxi / Uber',
    icon: 'Car',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'GAS',
    name: 'Gasolina',
    icon: 'Fuel',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'PARKING',
    name: 'Parqueadero',
    icon: 'ParkingCircle',
    color: 'category-transport',
    type: 'EXPENSE',
  },
  {
    key: 'CAR_MAINTENANCE',
    name: 'Mantenimiento Vehículo',
    icon: 'Wrench',
    color: 'category-transport',
    type: 'EXPENSE',
  },

  // HOUSING
  {
    key: 'RENT',
    name: 'Arriendo',
    icon: 'Home',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'MORTGAGE',
    name: 'Hipoteca',
    icon: 'Building',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'UTILITIES',
    name: 'Servicios Públicos',
    icon: 'Lightbulb',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'INTERNET_PHONE',
    name: 'Internet y Teléfono',
    icon: 'Wifi',
    color: 'category-bills',
    type: 'EXPENSE',
  },
  {
    key: 'HOME_MAINTENANCE',
    name: 'Mantenimiento Hogar',
    icon: 'Hammer',
    color: 'category-bills',
    type: 'EXPENSE',
  },

  // SHOPPING
  {
    key: 'CLOTHING',
    name: 'Ropa y Calzado',
    icon: 'ShoppingBag',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'ELECTRONICS',
    name: 'Electrónicos',
    icon: 'Laptop',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'HOME_GOODS',
    name: 'Artículos para el Hogar',
    icon: 'Sofa',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // ENTERTAINMENT
  {
    key: 'STREAMING',
    name: 'Streaming (Netflix, etc)',
    icon: 'Tv',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'MOVIES_EVENTS',
    name: 'Cine y Eventos',
    icon: 'Film',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'HOBBIES',
    name: 'Hobbies',
    icon: 'Palette',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'SPORTS',
    name: 'Deportes',
    icon: 'Dumbbell',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },
  {
    key: 'TRAVEL',
    name: 'Viajes',
    icon: 'Plane',
    color: 'category-entertainment',
    type: 'EXPENSE',
  },

  // HEALTH
  {
    key: 'MEDICAL',
    name: 'Médico y Medicamentos',
    icon: 'Heart',
    color: 'category-health',
    type: 'EXPENSE',
  },
  {
    key: 'DENTAL',
    name: 'Odontología',
    icon: 'Smile',
    color: 'category-health',
    type: 'EXPENSE',
  },
  {
    key: 'GYM',
    name: 'Gimnasio',
    icon: 'Dumbbell',
    color: 'category-health',
    type: 'EXPENSE',
  },
  {
    key: 'INSURANCE',
    name: 'Seguros',
    icon: 'Shield',
    color: 'category-health',
    type: 'EXPENSE',
  },

  // EDUCATION
  {
    key: 'TUITION',
    name: 'Matrícula',
    icon: 'GraduationCap',
    color: 'category-education',
    type: 'EXPENSE',
  },
  {
    key: 'BOOKS',
    name: 'Libros y Material',
    icon: 'Book',
    color: 'category-education',
    type: 'EXPENSE',
  },
  {
    key: 'COURSES',
    name: 'Cursos Online',
    icon: 'Monitor',
    color: 'category-education',
    type: 'EXPENSE',
  },

  // PERSONAL CARE
  {
    key: 'PERSONAL_CARE',
    name: 'Cuidado Personal',
    icon: 'Sparkles',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'HAIRCUT',
    name: 'Peluquería',
    icon: 'Scissors',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // FINANCIAL
  {
    key: 'BANK_FEES',
    name: 'Comisiones Bancarias',
    icon: 'Building2',
    color: 'category-debt',
    type: 'EXPENSE',
  },
  {
    key: 'CREDIT_CARD_PAYMENT',
    name: 'Pago Tarjeta de Crédito',
    icon: 'CreditCard',
    color: 'category-debt',
    type: 'EXPENSE',
  },
  {
    key: 'LOAN_PAYMENT',
    name: 'Pago Préstamo',
    icon: 'FileText',
    color: 'category-debt',
    type: 'EXPENSE',
  },
  {
    key: 'INVESTMENT',
    name: 'Inversiones',
    icon: 'TrendingUp',
    color: 'category-savings',
    type: 'EXPENSE',
  },
  {
    key: 'SAVINGS',
    name: 'Ahorro',
    icon: 'PiggyBank',
    color: 'category-savings',
    type: 'EXPENSE',
  },
  {
    key: 'ATM_WITHDRAWAL',
    name: 'Retiro Cajero',
    icon: 'Banknote',
    color: 'category-other',
    type: 'EXPENSE',
  },

  // GIFTS & DONATIONS
  {
    key: 'GIFTS',
    name: 'Regalos',
    icon: 'Gift',
    color: 'category-personal',
    type: 'EXPENSE',
  },
  {
    key: 'DONATIONS',
    name: 'Donaciones',
    icon: 'Heart',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // PETS
  {
    key: 'PETS',
    name: 'Mascotas',
    icon: 'Dog',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // CHILDREN
  {
    key: 'CHILDCARE',
    name: 'Cuidado Infantil',
    icon: 'Baby',
    color: 'category-personal',
    type: 'EXPENSE',
  },

  // TAXES
  {
    key: 'TAXES',
    name: 'Impuestos',
    icon: 'Receipt',
    color: 'category-bills',
    type: 'EXPENSE',
  },

  // OTHER
  {
    key: 'OTHER',
    name: 'Otros',
    icon: 'MoreHorizontal',
    color: 'category-other',
    type: 'EXPENSE',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed global categories
  console.log('📦 Creating global categories...');
  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created ${defaultCategories.length} categories`);
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
