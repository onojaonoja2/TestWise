#Requires -Version 5.1
<#
.SYNOPSIS
  Migrates the TestWise PostgreSQL database from Aiven to Railway.

.DESCRIPTION
  1. Enables the pgvector extension on the Railway database
     (required by DocumentChunk.embedding vector(1536)).
  2. Dumps the Aiven database with pg_dump (data + schema, no roles/ACLs).
  3. Restores it into Railway with pg_restore.
  4. Compares row counts on key tables as a sanity check.

  Secrets are NEVER stored in this repo. Both connection strings are read
  from environment variables set in your local shell only:

    $env:AIVEN_DATABASE_URL   = "postgres://..."   # source (Aiven)
    $env:RAILWAY_DATABASE_URL = "postgres://..."   # target (Railway, PUBLIC url)

  Prerequisites: PostgreSQL client tools (pg_dump, psql, pg_restore) on PATH.
  If the target Railway URL needs SSL from outside, append ?sslmode=require.

.EXAMPLE
  $env:AIVEN_DATABASE_URL = "postgres://avnadmin:...@.../defaultdb?sslmode=require"
  $env:RAILWAY_DATABASE_URL = "postgres://postgres:...@.../railway?sslmode=require"
  .\scripts\migrate-db-to-railway.ps1
#>
[CmdletBinding()]
param(
  [string]$BackupDir = (Join-Path ([System.IO.Path]::GetTempPath()) "testwise-db-migration")
)

$ErrorActionPreference = "Stop"

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required tool '$name' not found on PATH. Install PostgreSQL client tools (pg_dump, psql, pg_restore) and retry. See DEPLOYMENT.md."
  }
}

foreach ($tool in @("pg_dump", "psql", "pg_restore")) { Assert-Command $tool }

if (-not $env:AIVEN_DATABASE_URL) { throw 'Set $env:AIVEN_DATABASE_URL before running (source Aiven URL).' }
if (-not $env:RAILWAY_DATABASE_URL) { throw 'Set $env:RAILWAY_DATABASE_URL before running (target Railway PUBLIC URL).' }

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dumpFile = Join-Path $BackupDir "testwise-aiven-$stamp.dump"

Write-Host "== Step 1/4: enabling pgvector on Railway ==" -ForegroundColor Cyan
psql $env:RAILWAY_DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
if ($LASTEXITCODE -ne 0) {
  throw "Could not enable pgvector. If using Railway's standard Postgres, deploy the pgvector template instead (see DEPLOYMENT.md)."
}

Write-Host "== Step 2/4: dumping Aiven (this can take a while) ==" -ForegroundColor Cyan
Write-Host "Backup: $dumpFile"
$env:PGSSLMODE = "require"
pg_dump $env:AIVEN_DATABASE_URL --format=custom --no-owner --no-acl --file="$dumpFile"
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed." }

Write-Host "== Step 3/4: restoring into Railway ==" -ForegroundColor Cyan
Write-Host "Target tables will be replaced (clean + create-if-missing). Type YES to continue:" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "YES") { throw "Aborted by user. Dump kept at: $dumpFile" }
pg_restore --no-owner --no-acl --clean --if-exists --dbname="$env:RAILWAY_DATABASE_URL" "$dumpFile"
if ($LASTEXITCODE -ne 0) { throw "pg_restore failed. Dump kept at: $dumpFile" }

Write-Host "== Step 4/4: row-count sanity check ==" -ForegroundColor Cyan
$tables = @('"User"', '"Organization"', '"Test"', '"Submission"', '"Document"')
foreach ($t in $tables) {
  $src = (psql $env:AIVEN_DATABASE_URL -t -c "SELECT COUNT(*) FROM $t;") -join "" | ForEach-Object { $_.Trim() }
  $dst = (psql $env:RAILWAY_DATABASE_URL -t -c "SELECT COUNT(*) FROM $t;") -join "" | ForEach-Object { $_.Trim() }
  $ok = if ($src -eq $dst) { "OK" } else { "MISMATCH" }
  Write-Host ("  {0,-16} aiven={1,-8} railway={2,-8} [{3}]" -f $t, $src, $dst, $ok)
}

Write-Host ""
Write-Host "Done. Backup kept at: $dumpFile" -ForegroundColor Green
Write-Host "Next: point the Railway worker + Vercel at the new DATABASE_URL and run the E2E checks in DEPLOYMENT.md."
