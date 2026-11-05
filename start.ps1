$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$NodeRoot = Join-Path $ProjectRoot ".tools\node-v22.20.0-win-x64"
$Npm = Join-Path $NodeRoot "npm.cmd"

if (-not (Test-Path -LiteralPath $Npm)) {
  throw "Portable Node.js was not found. Run: npm install"
}

$env:Path = "$NodeRoot;$env:Path"

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules"))) {
  Push-Location $ProjectRoot
  try {
    & $Npm install
  } finally {
    Pop-Location
  }
}

& $Npm run dev
