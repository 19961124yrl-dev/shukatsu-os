$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$requiredFiles = @(
  'index.html',
  'app.js',
  'styles.css',
  'manifest.webmanifest',
  'service-worker.js',
  'README.md'
)

foreach ($file in $requiredFiles) {
  $path = Join-Path $root $file
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required file is missing: $file"
  }
}

$html = Get-Content -LiteralPath (Join-Path $root 'index.html') -Raw -Encoding UTF8
foreach ($reference in @('app.js', 'styles.css', 'manifest.webmanifest')) {
  if ($html -notmatch [regex]::Escape($reference)) {
    throw "index.html does not reference: $reference"
  }
}

$app = Get-Content -LiteralPath (Join-Path $root 'app.js') -Raw -Encoding UTF8
foreach ($token in @('indexedDB.open', 'export-json', 'export-csv')) {
  if ($app -notmatch [regex]::Escape($token)) {
    throw "app.js lacks a required implementation: $token"
  }
}

Write-Host 'Static source verification passed.' -ForegroundColor Green
