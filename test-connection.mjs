import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";

// Load .env.local manually
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

const notion = new Client({
    auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

async function testConnection() {
    console.log("Testing Notion API connection...");
    console.log(`Database ID: ${databaseId}`);

    try {
        const queryResponse = await notion.search({
            query: "",
            filter: {
                property: "object",
                value: "page",
            },
            sort: {
                direction: "descending",
                timestamp: "last_edited_time",
            },
        });

        // Use the logic from lib/notion.ts
        const dbItems = queryResponse.results.filter(item => {
            const pid = item.parent.database_id;
            return pid && pid.replaceAll("-", "") === databaseId.replaceAll("-", "");
        });

        console.log(`\nMatched ${dbItems.length} items in target DB.`);

        if (dbItems.length > 0) {
            const item = dbItems[0];
            console.log("--- First Item Properties Keys ---");
            console.log(Object.keys(item.properties));

            console.log("--- First Item Properties Detail ---");
            console.log(JSON.stringify(item.properties, null, 2));

            console.log("--- First Item ID ---");
            console.log(item.id);
        } else {
            console.log("⚠ No items found in this database via Search.");
        }

    } catch (error) {
        console.error("❌ Connection failed:");
        console.error(error);
    }
}

testConnection();
