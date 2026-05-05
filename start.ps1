# start.ps1
$cf = "C:\Users\bourb\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"

# Nettoie logs
if (Test-Path "backend-out.log")  { Remove-Item "backend-out.log" }
if (Test-Path "backend-err.log")  { Remove-Item "backend-err.log" }
if (Test-Path "frontend-out.log") { Remove-Item "frontend-out.log" }
if (Test-Path "frontend-err.log") { Remove-Item "frontend-err.log" }

Write-Host "Lance tunnel backend..." -ForegroundColor Yellow
Start-Process $cf -ArgumentList "tunnel --url http://localhost:8000" -RedirectStandardOutput "backend-out.log" -RedirectStandardError "backend-err.log" -NoNewWindow

Write-Host "Attente URL backend..."
$backendUrl = ""
$elapsed = 0
while ($backendUrl -eq "" -and $elapsed -lt 40) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "  ... $elapsed s"
    foreach ($f in @("backend-out.log","backend-err.log")) {
        if (Test-Path $f) {
            $log = Get-Content $f -Raw -ErrorAction SilentlyContinue
            if ($log) {
                $m = [regex]::Match($log, 'https://[a-z0-9\-]+\.trycloudflare\.com')
                if ($m.Success) { $backendUrl = $m.Value; break }
            }
        }
    }
}

if ($backendUrl -eq "") {
    Write-Host "ERREUR: URL backend non trouvee. Laravel tourne sur :8000 ?" -ForegroundColor Red
    exit 1
}
Write-Host "Backend: $backendUrl" -ForegroundColor Green

Write-Host "Lance tunnel frontend..." -ForegroundColor Yellow
Start-Process $cf -ArgumentList "tunnel --url http://localhost:3000" -RedirectStandardOutput "frontend-out.log" -RedirectStandardError "frontend-err.log" -NoNewWindow

Write-Host "Attente URL frontend..."
$frontendUrl = ""
$elapsed = 0
while ($frontendUrl -eq "" -and $elapsed -lt 40) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "  ... $elapsed s"
    foreach ($f in @("frontend-out.log","frontend-err.log")) {
        if (Test-Path $f) {
            $log = Get-Content $f -Raw -ErrorAction SilentlyContinue
            if ($log) {
                $m = [regex]::Match($log, 'https://[a-z0-9\-]+\.trycloudflare\.com')
                if ($m.Success) { $frontendUrl = $m.Value; break }
            }
        }
    }
}

if ($frontendUrl -eq "") {
    Write-Host "URL frontend non trouvee, utilise localhost" -ForegroundColor Yellow
    $frontendUrl = "http://localhost:3000"
}
Write-Host "Frontend: $frontendUrl" -ForegroundColor Green

# ============================================================
# ✅ NOUVEAU — Lire AI_SERVICE_URL depuis Google Drive
# ============================================================
$aiUrl = ""
$aiEnvPath = "$env:USERPROFILE\Google Drive\My Drive\data\.env_ai"

# Essaie aussi le chemin alternatif Google Drive Desktop
if (-not (Test-Path $aiEnvPath)) {
    $aiEnvPath = "G:\Mon Drive\data\.env_ai"
}
if (-not (Test-Path $aiEnvPath)) {
    $aiEnvPath = "G:\My Drive\data\.env_ai"
}

if (Test-Path $aiEnvPath) {
    $aiLine = Get-Content $aiEnvPath | Where-Object { $_ -match "AI_SERVICE_URL" }
    if ($aiLine) {
        $aiUrl = $aiLine.Trim()
        Write-Host "IA (Colab): $aiUrl" -ForegroundColor Cyan
    } else {
        Write-Host "Fichier .env_ai trouve mais AI_SERVICE_URL manquant" -ForegroundColor Yellow
    }
} else {
    Write-Host "Fichier .env_ai non trouve dans Drive (Colab pas encore lance ?)" -ForegroundColor Yellow
    Write-Host "  Chemin cherche : $aiEnvPath" -ForegroundColor DarkGray
}
# ============================================================

# Met a jour .env.local
$env1 = "BACKEND_URL=" + $backendUrl
$env2 = "NEXT_PUBLIC_API_URL=/api"
$env3 = "NEXT_PUBLIC_FRONTEND_URL=" + $frontendUrl
$env1, $env2, $env3 | Set-Content ".env.local"
Write-Host ".env.local mis a jour!" -ForegroundColor Green

# Met a jour Laravel .env
$laravelPath = "C:\xampp\htdocs\Pfe\.env"
if (Test-Path $laravelPath) {
    $lenv = Get-Content $laravelPath -Raw
    $lenv = $lenv -replace 'FRONTEND_URL=.*', ("FRONTEND_URL=" + $frontendUrl)

    # ✅ NOUVEAU — Met a jour AI_SERVICE_URL dans Laravel .env
    if ($aiUrl -ne "") {
        if ($lenv -match "AI_SERVICE_URL=") {
            $lenv = $lenv -replace 'AI_SERVICE_URL=.*', $aiUrl
        } else {
            $lenv = $lenv + "`nAI_SERVICE_URL=" + $aiUrl.Replace("AI_SERVICE_URL=", "")
        }
        Write-Host "Laravel .env : AI_SERVICE_URL mis a jour!" -ForegroundColor Cyan
    }

    Set-Content $laravelPath $lenv
    Write-Host "Laravel .env mis a jour!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
Write-Host "Frontend : $frontendUrl" -ForegroundColor Green
Write-Host "Backend  : $backendUrl" -ForegroundColor Green
Write-Host "IA Colab : $(if ($aiUrl) { $aiUrl } else { 'non configure' })" -ForegroundColor Cyan
Write-Host "QR Code  : $frontendUrl/sign/TOKEN" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demarrage Next.js..." -ForegroundColor Yellow

npm run dev