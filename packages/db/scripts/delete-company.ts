/**
 * Script to delete a company and all its associated data from the database.
 * Usage: npx tsx packages/db/scripts/delete-company.ts <companyName>
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../dist/schema/index.js";
import { eq } from "drizzle-orm";
import { resolveDatabaseTarget } from "../dist/runtime-config.js";

async function main() {
  const companyName = process.argv[2];
  if (!companyName) {
    console.error("Usage: npx tsx packages/db/scripts/delete-company.ts <companyName>");
    process.exit(1);
  }

  console.log(`Deleting company: ${companyName}\n`);

  // Get database config
  const dbTarget = resolveDatabaseTarget();
  console.log(`Database mode: ${dbTarget.mode}`);
  
  let url: string;
  if (dbTarget.mode === "embedded-postgres") {
    console.log(`Data dir: ${dbTarget.dataDir}`);
    console.log(`Port: ${dbTarget.port}`);
    url = `postgres://localhost:${dbTarget.port}/${dbTarget.dataDir}`;
  } else {
    url = dbTarget.connectionString;
  }

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  // Get the company by name
  type Company = typeof schema.companies.$inferSelect;
  const companyResults: Company[] = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.name, companyName))
    .limit(1);

  if (companyResults.length === 0) {
    console.log(`Company "${companyName}" not found.`);
    await sql.end();
    process.exit(0);
  }

  const company = companyResults[0];
  console.log(`Found company: ${company.id} (${company.name})\n`);

  // Tables that have companyId foreign key (delete children first to avoid FK violations)
  const childTables = [
    // Level 1 - direct children
    "activity_log",
    "agent_task_sessions",
    "agent_wakeup_requests", 
    "cost_events",
    "goals",
    "heartbeat_runs",
    "invites",
    "join_requests",
    "labels",
    "projects",
    "workspace_runtime_services",
    // Level 2 - agents and their configs
    "agent_api_keys",
    "agent_config_revisions", 
    "agent_runtime_state",
    "agents",
    // Level 3 - issues
    "issue_approvals",
    "issue_attachments",
    "issue_comments",
    "issue_documents",
    "issue_labels",
    "issue_read_states",
    "issues",
    // Level 4 - documents
    "document_revisions",
    "documents",
    // Level 5 - approvals
    "approval_comments",
    "approvals",
    // Level 6 - company settings
    "company_secrets",
    "company_secret_versions",
    "company_memberships",
    // Level 7 - plugins
    "plugin_company_settings",
    "plugin_config",
    "plugin_entities",
    "plugin_jobs",
    "plugin_logs",
    "plugin_state",
    "plugin_webhooks",
    "plugins",
    // Level 8 - principal permissions
    "principal_permission_grants",
    // Level 9 - instance roles
    "instance_user_roles",
  ];

  console.log("Deleting associated data...\n");
  
  let totalDeleted = 0;
  for (const table of childTables) {
    try {
      const result = await sql.unsafe(`DELETE FROM ${table} WHERE company_id = $1`, [company.id]);
      if (result.count && result.count > 0) {
        console.log(`  ✓ Deleted ${result.count} rows from ${table}`);
        totalDeleted += result.count;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ${table}: ${message}`);
    }
  }

  // Finally delete the company
  await db.delete(schema.companies).where(eq(schema.companies.id, company.id));
  
  console.log(`\n✓ Company "${companyName}" deleted (${totalDeleted} associated rows removed)`);

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
