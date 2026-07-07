import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide the user's email. Usage: npx ts-node src/make_admin.ts user@example.com");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found in database.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`✅ Success! User "${user.name}" (${email}) has been upgraded to Admin.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error upgrading user:", err);
  process.exit(1);
});
