import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

console.log("\n--- Checking Client Object ---");
import util from "util";
console.log(util.inspect(notion.databases, { showHidden: true, depth: 2, colors: true }));
console.log("------------------------------\n");

if (notion.databases && typeof notion.databases.query === 'function') {
    console.log("Databases query method: function");
} else {
    console.log("Databases query method: undefined or missing");
}

console.log("\n--- Checking Target ID Type ---");
console.log("Target ID:", databaseId);

try {
    const page = await notion.pages.retrieve({ page_id: databaseId });
    console.log("Is Page: Yes");
    console.log("Page Object:", JSON.stringify(page, null, 2));
} catch (e) {
    console.log("Is Page: No (or error)", e.message);
}

try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    console.log("Is Database: Yes");
    console.log("Database Object:", JSON.stringify(db, null, 2));
} catch (e) {
    console.log("Is Database: No (or error)", e.message);
}
