# ==============================================================================
# Script Triển Khai Đồng Bộ Kỹ Năng Đa Trình Agent (Multi-Agent Ecosystem)
# Hỗ trợ: Antigravity IDE, Gemini CLI, Claude Code, Codex, Cursor & Windsurf
# ==============================================================================

$hubRoot = Split-Path -Parent $PSScriptRoot
$sourceSkill = Join-Path $hubRoot ".agents\skills\.xay-dung-nao-bo"
$sourceCompact = Join-Path $hubRoot ".agents\skills\.compact"

$geminiSkillsRoot = "C:\Users\hoang\.gemini\config\skills"
$claudeCommandsRoot = "C:\Users\hoang\.claude\commands"

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "🚀 ĐANG TRIỂN KHAI SKILLS SANG TOÀN BỘ HỆ SINH THÁI AI AGENT..." -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "📁 Source: $hubRoot\.agents\skills\" -ForegroundColor DarkGray

# 1. Kiểm tra an toàn trước khi deploy (Safety Validation Gate)
if (-not (Test-Path $sourceSkill)) {
    Write-Error "❌ Không tìm thấy thư mục nguồn: $sourceSkill"
    exit 1
}
if (-not (Test-Path $sourceCompact)) {
    Write-Error "❌ Không tìm thấy thư mục nguồn: $sourceCompact"
    exit 1
}

try {
    # -------------------------------------------------------------------------
    # Target 1: Google Antigravity & Gemini CLI (Global Skills)
    # -------------------------------------------------------------------------
    $destSkillGemini = Join-Path $geminiSkillsRoot ".xay-dung-nao-bo"
    $destCompactGemini = Join-Path $geminiSkillsRoot ".compact"

    if (-not (Test-Path $destSkillGemini)) {
        New-Item -Path $destSkillGemini -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$sourceSkill\*" -Destination $destSkillGemini -Recurse -Force

    if (-not (Test-Path $destCompactGemini)) {
        New-Item -Path $destCompactGemini -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "$sourceCompact\*" -Destination $destCompactGemini -Recurse -Force

    Write-Host "✅ [1/2] Đã deploy Global Skills cho Antigravity / Gemini CLI -> $geminiSkillsRoot" -ForegroundColor Green

    # -------------------------------------------------------------------------
    # Target 2: Anthropic Claude Code (Global Command: /xay-dung-nao-bo)
    # -------------------------------------------------------------------------
    if (Test-Path $claudeCommandsRoot) {
        $claudeInitBrainCommand = Join-Path $claudeCommandsRoot "xay-dung-nao-bo.md"
        # KHONG deploy "compact.md": ten do DE LEN lenh /compact built-in cua Claude Code,

        $claudeInitBrainContent = @'
# Lệnh Tự Động Khởi Tạo / Nâng Cấp Não Bộ (Universal Brain Engine V5.2)

Khởi tạo mới hoặc Tự động Chẩn đoán & Tái cấu trúc bộ nhớ `brain4agent` Đa Tầng cho dự án hiện tại.

## Hướng dẫn thực thi:
1. Đảm bảo đang đứng ở thư mục gốc của dự án hiện tại.
2. Chạy lệnh chẩn đoán & build não bộ:
   ```bash
   node "C:/Users/hoang/.gemini/config/skills/.xay-dung-nao-bo/scripts/init_brain.js"
   ```
3. Đọc kết quả:
   - Nếu báo "NÃO ĐÃ OK": Thông báo cho user bộ não đã đạt chuẩn hoàn hảo.
   - Nếu tạo mới hoặc nâng cấp: Đọc bối cảnh repo và cập nhật thông tin thực tế vào `project-intro.md`, `memory-distill.txt`, `index.md`.
'@

        Set-Content -Path $claudeInitBrainCommand -Value $claudeInitBrainContent -Encoding UTF8
        # va nghi thuc ghi nao da co lenh rieng /luu-nao. Xem gotcha #13.

        Write-Host "✅ [2/2] Đã deploy Global Command cho Claude Code (/xay-dung-nao-bo) -> $claudeCommandsRoot" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Không tìm thấy thư mục Claude Code ($claudeCommandsRoot), bỏ qua target này." -ForegroundColor Gray
    }

    Write-Host "`n===========================================================" -ForegroundColor Yellow
    Write-Host "🎉 HOÀN TẤT ĐỒNG BỘ TOÀN BỘ CÁC TRÌNH AI AGENT THÀNH CÔNG!" -ForegroundColor Yellow
    Write-Host "===========================================================`n" -ForegroundColor Yellow
} catch {
    Write-Error "❌ Lỗi trong quá trình deploy: $_"
    exit 1
}
