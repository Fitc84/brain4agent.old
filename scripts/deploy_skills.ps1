# ==============================================================================
# Script Triển Khai Đồng Bộ Kỹ Năng Từ Brain Hub Sang Global AI Skills
# ==============================================================================

$hubRoot = Split-Path -Parent $PSScriptRoot
$sourceSkill = Join-Path $hubRoot ".agents\skills\.xay-dung-nao-bo"
$sourceCompact = Join-Path $hubRoot ".agents\skills\.compact"

$destGlobalRoot = "C:\Users\hoang\.gemini\config\skills"
$destSkill = Join-Path $destGlobalRoot ".xay-dung-nao-bo"
$destCompact = Join-Path $destGlobalRoot ".compact"

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "🚀 ĐANG TRIỂN KHAI (DEPLOY) SKILLS TỪ BRAIN HUB SANG GLOBAL CONFIG..." -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "📁 Hub Source: $hubRoot\.agents\skills\" -ForegroundColor DarkGray
Write-Host "🌐 Global Target: $destGlobalRoot`n" -ForegroundColor DarkGray

# 1. Kiểm tra an toàn trước khi deploy (Safety Validation Gate)
if (-not (Test-Path $sourceSkill)) {
    Write-Error "❌ Không tìm thấy thư mục nguồn: $sourceSkill"
    exit 1
}
if (-not (Test-Path $sourceCompact)) {
    Write-Error "❌ Không tìm thấy thư mục nguồn: $sourceCompact"
    exit 1
}

# 2. Thực hiện copy an toàn
try {
    # Deploy .xay-dung-nao-bo
    if (-not (Test-Path $destSkill)) {
        New-Item -Path $destSkill -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$sourceSkill\*" -Destination $destSkill -Recurse -Force
    Write-Host "✅ [1/2] Đã deploy thành công: .xay-dung-nao-bo -> $destSkill" -ForegroundColor Green

    # Deploy .compact
    if (-not (Test-Path $destCompact)) {
        New-Item -Path $destCompact -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$sourceCompact\*" -Destination $destCompact -Recurse -Force
    Write-Host "✅ [2/2] Đã deploy thành công: .compact -> $destCompact" -ForegroundColor Green

    Write-Host "`n===========================================================" -ForegroundColor Yellow
    Write-Host "🎉 HOÀN TẤT ĐỒNG BỘ TOÀN HỆ THỐNG GLOBAL AI SKILLS THÀNH CÔNG!" -ForegroundColor Yellow
    Write-Host "===========================================================`n" -ForegroundColor Yellow
} catch {
    Write-Error "❌ Lỗi trong quá trình deploy: $_"
    exit 1
}
