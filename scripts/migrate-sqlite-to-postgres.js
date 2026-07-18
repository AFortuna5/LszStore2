/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { Pool } = require("pg");

const sourcePath = path.resolve(process.env.MIGRATION_SOURCE_SQLITE || "dev.db");
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const allowNonEmpty = process.argv.includes("--allow-non-empty");

const tables = [
  "User",
  "Category",
  "Product",
  "ProductVariant",
  "Address",
  "Order",
  "OrderItem",
  "PasswordResetToken",
  "NewsletterSubscriber",
  "ContactMessage",
  "InventoryMovement",
];

const booleanColumns = {
  Product: new Set(["isFeatured", "isPremium", "isNew"]),
  ProductVariant: new Set(["isDefault"]),
  NewsletterSubscriber: new Set(["active"]),
};

function quote(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function main() {
  if (!fs.existsSync(sourcePath)) throw new Error(`Banco SQLite nao encontrado: ${sourcePath}`);
  if (!connectionString?.startsWith("postgres")) throw new Error("Configure DATABASE_URL ou DIRECT_URL do PostgreSQL");

  const sqlite = new Database(sourcePath, { readonly: true });
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  const client = await pool.connect();

  try {
    const existing = await client.query('SELECT COUNT(*)::int AS count FROM "User"');
    if (existing.rows[0].count > 0 && !allowNonEmpty) {
      throw new Error("O PostgreSQL ja possui dados. Use um banco vazio ou execute com --allow-non-empty para ignorar IDs existentes.");
    }

    await client.query("BEGIN");
    const report = [];
    for (const table of tables) {
      const sourceExists = sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(table);
      if (!sourceExists) { report.push({ table, source: 0, imported: 0 }); continue; }

      const rows = sqlite.prepare(`SELECT * FROM ${quote(table)}`).all();
      let imported = 0;
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = columns.map((column) => booleanColumns[table]?.has(column) ? Boolean(row[column]) : row[column]);
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        const result = await client.query(
          `INSERT INTO ${quote(table)} (${columns.map(quote).join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values,
        );
        imported += result.rowCount ?? 0;
      }
      report.push({ table, source: rows.length, imported });
    }
    await client.query("COMMIT");

    console.table(report);
    console.log("Migracao concluida. O arquivo SQLite original nao foi alterado.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
