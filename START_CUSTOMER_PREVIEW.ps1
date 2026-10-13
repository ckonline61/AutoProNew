$ErrorActionPreference = 'Stop'
$customerDirectory = Join-Path $PSScriptRoot 'customer-mobile'
Push-Location $customerDirectory
try {
  $existingPreview = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue
  if ($existingPreview) {
    $previewStatus = Invoke-WebRequest 'http://127.0.0.1:8081/status' -UseBasicParsing -TimeoutSec 5
    $previewStatusText = if ($previewStatus.Content -is [byte[]]) { [System.Text.Encoding]::UTF8.GetString($previewStatus.Content) } else { [string]$previewStatus.Content }
    if ($previewStatusText -notmatch 'packager-status:running') { throw 'Port 8081 is occupied by another service.' }
    $previewNetwork = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.IPv4Address } | Select-Object -First 1
    $previewUrl = "exp://$($previewNetwork.IPv4Address.IPAddress):8081"
    Write-Output "Expo is already running: $previewUrl"
    node -e "require('./node_modules/@expo/cli/build/src/utils/qr').printQRCode(process.argv[1]).print()" $previewUrl
    return
  }
  npm.cmd start -- --host lan --port 8081
} finally {
  Pop-Location
}
