# start.ps1
$cf = "C:\Users\bourb\AppData\Local\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"

# Nettoie logs
if (Test-Path "backend-out.log")  { Remove-Item "backend-out.log" }
if (Test-Path "backend-err.log")  { Remove-Item "backend-err.log" }
if (Test-Path "frontend-out.log") { Remove-Item "frontend-out.log" }
if (Test-Path "frontend-err.log") { Remove-Item "frontend-err.log" }
if (Test-Path "flask-out.log")    { Remove-Item "flask-out.log" }
if (Test-Path "flask-err.log")    { Remove-Item "flask-err.log" }

# ============================================================
# ✅ Lance Flask CV API
# ============================================================
Write-Host "Lance Flask CV API..." -ForegroundColor Yellow
$flaskDir = 'C:\Users\bourb\OneDrive\Bureau\modelextraction\main'
Start-Process "python" `
    -ArgumentList "app.py" `
    -WorkingDirectory $flaskDir `
    -RedirectStandardOutput "flask-out.log" `
    -RedirectStandardError "flask-err.log" `
    -NoNewWindow

Write-Host "Attente Flask..."
$flaskReady = $false
$elapsed = 0
while (-not $flaskReady -and $elapsed -lt 60) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "  ... $elapsed s"
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { $flaskReady = $true }
    } catch {}
}

if ($flaskReady) {
    Write-Host "Flask CV API prete -> http://127.0.0.1:5000" -ForegroundColor Green
} else {
    Write-Host "Flask pas encore prete (modeles lents, continue quand meme)" -ForegroundColor Yellow
}
# ============================================================

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
# Lire AI_SERVICE_URL depuis Google Drive
# ============================================================
$aiUrl = ""
$aiEnvPath = "$env:USERPROFILE\Google Drive\My Drive\data\.env_ai"
if (-not (Test-Path $aiEnvPath)) { $aiEnvPath = "G:\Mon Drive\data\.env_ai" }
if (-not (Test-Path $aiEnvPath)) { $aiEnvPath = "G:\My Drive\data\.env_ai" }

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
Write-Host "Flask    : http://127.0.0.1:5000" -ForegroundColor Magenta
Write-Host "IA Colab : $(if ($aiUrl) { $aiUrl } else { 'non configure' })" -ForegroundColor Cyan
Write-Host "QR Code  : $frontendUrl/sign/TOKEN" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demarrage Next.js..." -ForegroundColor Yellow

npm run dev