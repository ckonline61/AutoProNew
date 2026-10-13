# Run with: powershell -ExecutionPolicy Bypass -File .\START_PREVIEW.ps1
$ErrorActionPreference = 'Stop'
$previewRoot = $PSScriptRoot
$previewLogs = Join-Path $env:TEMP 'auto-pro-preview'
New-Item -ItemType Directory -Force $previewLogs | Out-Null
$previewNode = (Get-Command node -ErrorAction Stop).Source
$previewServices = @(
  @{ Name = 'backend'; Port = 5000; Arguments = 'dist/index.js'; Url = 'http://127.0.0.1:5000/api/v1/health' },
  @{ Name = 'web'; Port = 5174; Arguments = 'node_modules/vite/bin/vite.js --host 127.0.0.1 --strictPort'; Url = 'http://127.0.0.1:5174/' },
  @{ Name = 'admin'; Port = 5173; Arguments = 'node_modules/vite/bin/vite.js --host 127.0.0.1 --strictPort'; Url = 'http://127.0.0.1:5173/login' }
)
foreach ($previewService in $previewServices) {
  $previewDirectory = Join-Path $previewRoot $previewService.Name
  if (-not (Test-Path (Join-Path $previewDirectory 'node_modules'))) { throw "Install dependencies in $($previewService.Name) first." }
  $previewListening = Get-NetTCPConnection -State Listen -LocalPort $previewService.Port -ErrorAction SilentlyContinue
  if (-not $previewListening) {
    if ($previewService.Name -eq 'backend') {
      Push-Location $previewDirectory
      try { npm.cmd run build; if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' } } finally { Pop-Location }
    }
    Start-Process -FilePath $previewNode -ArgumentList $previewService.Arguments -WorkingDirectory $previewDirectory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewLogs "$($previewService.Name).log") -RedirectStandardError (Join-Path $previewLogs "$($previewService.Name)-error.log") | Out-Null
  }
  $previewReady = $false
  for ($previewAttempt = 0; $previewAttempt -lt 30; $previewAttempt++) {
    try {
      $previewResponse = Invoke-WebRequest $previewService.Url -TimeoutSec 2 -UseBasicParsing
      if ($previewResponse.StatusCode -eq 200) { $previewReady = $true; break }
    } catch { Start-Sleep -Milliseconds 500 }
  }
  if (-not $previewReady) { throw "$($previewService.Name) failed to start. Check $previewLogs and MongoDB service." }
  Write-Output "$($previewService.Name): $($previewService.Url)"
}
Write-Output "Logs: $previewLogs"
