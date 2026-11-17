import "dotenv/config";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const walkthrough = {
  roles: [
    { role: "Owner", email: process.env.WALKTHROUGH_OWNER_EMAIL ?? "owner@area71.com", password: process.env.WALKTHROUGH_OWNER_PASSWORD ?? "owner123" },
    { role: "Operations", email: process.env.WALKTHROUGH_OPERATIONS_EMAIL ?? "operations@area71.com", password: process.env.WALKTHROUGH_OPERATIONS_PASSWORD ?? "ops123" },
    { role: "Sourcing", email: process.env.WALKTHROUGH_SOURCING_EMAIL ?? "sourcing@area71.com", password: process.env.WALKTHROUGH_SOURCING_PASSWORD ?? "sourcing123" },
    { role: "Client", email: process.env.WALKTHROUGH_CLIENT_EMAIL ?? "client@area71.com", password: process.env.WALKTHROUGH_CLIENT_PASSWORD ?? "client123" },
    { role: "Supplier", email: process.env.WALKTHROUGH_SUPPLIER_EMAIL ?? "supplier@area71.com", password: process.env.WALKTHROUGH_SUPPLIER_PASSWORD ?? "supplier123" },
  ],
  orders: [
    {
      orderNumber: "A71-1042",
      productName: "Portable Thermal Scanner",
      status: "Awaiting approval",
      client: "Northstar Retail",
      supplier: "Summit Goods",
      difference: 500,
    },
    {
      orderNumber: "A71-1048",
      productName: "Smart Display Stand",
      status: "Matched",
      client: "Northstar Retail",
      supplier: "Bayside Manufacturing",
      difference: 0,
    },
    {
      orderNumber: "A71-1051",
      productName: "Eco Smart Lamp",
      status: "Needs review",
      client: "Portland Market Co.",
      supplier: "Summit Goods",
      difference: 500,
    },
    {
      orderNumber: "A71-1059",
      productName: "Warehouse Safety Kit",
      status: "Disputed",
      client: "Portland Market Co.",
      supplier: "Bayside Manufacturing",
      difference: 1100,
    },
    {
      orderNumber: "A71-1063",
      productName: "Cold Chain Sensor Pack",
      status: "Closed",
      client: "Northstar Retail",
      supplier: "Summit Goods",
      difference: 0,
    },
  ],
};

const outputPath = resolve(process.cwd(), ".walkthrough-seed.json");
writeFileSync(outputPath, JSON.stringify(walkthrough, null, 2));

console.log(`Walkthrough seed file written to ${outputPath}`);
console.log(JSON.stringify(walkthrough.roles, null, 2));
