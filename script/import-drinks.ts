import { db } from "../server/db";
import { caffeineItems } from "../shared/schema";
import fs from "fs";
import path from "path";

async function importDrinks() {
  console.log("Reading JSON file...");
  const jsonPath = path.join(process.cwd(), "attached_assets/caffeine_items_copy_1769705796875.json");
  const jsonData = fs.readFileSync(jsonPath, "utf-8");
  const items = JSON.parse(jsonData);
  
  console.log(`Found ${items.length} items to import`);
  
  // Transform to match database schema
  const dbItems = items.map((item: any) => ({
    id: item.id,
    name: item.name,
    productUrl: item.productUrl,
    floz: item.floz,
    calories: item.calories ?? null,
    caffeine: item.caffeine,
    mgFloz: item.mgFloz ?? null,
    imageUrl: item.imageUrl ?? null,
    sugar: item.sugar ?? null,
  }));
  
  console.log("Inserting into database...");
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < dbItems.length; i += batchSize) {
    const batch = dbItems.slice(i, i + batchSize);
    await db.insert(caffeineItems).values(batch).onConflictDoNothing();
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dbItems.length / batchSize)}`);
  }
  
  console.log("Import complete!");
  process.exit(0);
}

importDrinks().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
