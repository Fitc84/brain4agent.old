# ==============================================================================
# Script Triển Khai Đồng Bộ Kỹ Năng Đa Trình Agent (Multi-Agent Ecosystem)
# Hỗ trợ: Antigravity IDE, Gemini CLI, Claude Code, Codex, Cursor & Windsurf
# FAIL-CLOSED theo SPEC-P03 (kế hoạch #09): đối chiếu SHA-256 nguồn <-> đích,
# ghi file văn bản UTF-8 KHÔNG BOM bằng bộ ghi .NET, bắt buộc pwsh 7.
# ==============================================================================
#requires -Version 7.0
[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$VerifyOnly,
    [string]$GeminiSkillsRoot = (Join-Path $HOME '.gemini/config/skills'),
    [string]$ClaudeCommandsRoot = (Join-Path $HOME '.claude/commands')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { $null = $_ }

# Mặc định là TỰ LỖI (3). Chỉ được hạ xuống 0 sau khi đi hết bước đối chiếu B5.
$exit = 3

function Write-Row {
    param([string]$Status, [string]$Hash, [string]$Rel, [string]$Note = '')
    $line = '{0,-8} {1,-9} {2}' -f $Status, $Hash, $Rel
    if ($Note) { $line = "$line  $Note" }
    Write-Host $line
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Content)
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding $false))
}

try {
    # -------------------------------------------------------------------------
    # B1. NGUỒN — thiếu thư mục nguồn => mã thoát 1
    # -------------------------------------------------------------------------
    $hubRoot = Split-Path -Parent $PSScriptRoot

    Write-Host "`n===========================================================" -ForegroundColor Cyan
    Write-Host "🚀 ĐANG TRIỂN KHAI SKILLS SANG TOÀN BỘ HỆ SINH THÁI AI AGENT..." -ForegroundColor Cyan
    Write-Host "===========================================================" -ForegroundColor Cyan
    $mode = if ($DryRun) { 'DRY-RUN (không ghi)' } elseif ($VerifyOnly) { 'VERIFY-ONLY (không ghi)' } else { 'DEPLOY' }
    Write-Host "📁 Source : $hubRoot\.agents\skills\" -ForegroundColor DarkGray
    Write-Host "📦 Gemini : $GeminiSkillsRoot" -ForegroundColor DarkGray
    Write-Host "📦 Claude : $ClaudeCommandsRoot" -ForegroundColor DarkGray
    Write-Host "⚙️  Mode   : $mode" -ForegroundColor DarkGray
    Write-Host ''

    $sources = [ordered]@{
        '.xay-dung-nao-bo' = (Join-Path $hubRoot '.agents/skills/.xay-dung-nao-bo')
        '.compact'         = (Join-Path $hubRoot '.agents/skills/.compact')
    }
    foreach ($name in $sources.Keys) {
        if (-not (Test-Path -LiteralPath $sources[$name] -PathType Container)) {
            $exit = 1
            Write-Error "❌ Không tìm thấy thư mục nguồn: $($sources[$name])"
        }
    }

    # -------------------------------------------------------------------------
    # B2. KẾ HOẠCH — liệt kê đệ quy mọi file nguồn + hash nguồn
    # -------------------------------------------------------------------------
    $plan = [System.Collections.Generic.List[object]]::new()
    foreach ($name in $sources.Keys) {
        $srcDir = (Resolve-Path -LiteralPath $sources[$name]).Path
        $destDir = Join-Path $GeminiSkillsRoot $name
        foreach ($file in (Get-ChildItem -LiteralPath $srcDir -File -Recurse -Force -ErrorAction Stop)) {
            $rel = ($file.FullName.Substring($srcDir.Length).TrimStart('\', '/')) -replace '\\', '/'
            $plan.Add([pscustomobject]@{
                    Rel     = "$name/$rel"
                    Src     = $file.FullName
                    Dest    = (Join-Path $destDir $rel)
                    SrcHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256 -ErrorAction Stop).Hash
                })
        }
    }
    $planRels = @($plan.Rel)

    # File lệnh Claude Code — CẤM trùng tên lệnh built-in (gotcha #13)
    $reservedCommandNames = @(
        'compact', 'clear', 'help', 'model', 'init', 'context', 'config', 'cost', 'doctor',
        'login', 'logout', 'memory', 'review', 'status', 'terminal-setup', 'vim', 'bug',
        'pr-comments', 'release-notes'
    )
    $cmdName = 'xay-dung-nao-bo'
    if ($reservedCommandNames -contains $cmdName) {
        throw "Tên file lệnh '$cmdName' trùng lệnh built-in của Claude Code — CẤM deploy (gotcha #13)."
    }
    $cmdPath = Join-Path $ClaudeCommandsRoot "$cmdName.md"
    # Đường dẫn engine trong bản global — dẫn xuất từ -GeminiSkillsRoot, KHÔNG hardcode
    # đường dẫn máy người dùng vào repo PUBLIC (SPEC-P03 (b) BẮT BUỘC 6).
    $enginePathForCmd = ((Join-Path (Join-Path $GeminiSkillsRoot '.xay-dung-nao-bo') 'scripts/init_brain.js') -replace '\\', '/')
    $cmdTemplate = @'
# Lệnh Khởi Tạo / Nâng Cấp Não Bộ (Universal Brain Engine)

Chẩn đoán & tái cấu trúc bộ nhớ `brain4agent` Đa Tầng cho dự án hiện tại.

## Hướng dẫn thực thi:
1. Đảm bảo đang đứng ở thư mục gốc của dự án hiện tại.
2. **Chẩn đoán trước (CHỈ ĐỌC — không ghi byte nào):**
   ```bash
   node "__ENGINE_PATH__" --check
   ```
3. Xử lý theo **mã thoát** của bước 2:
   - **0** — báo "NÃO ĐÃ OK": não bộ đã đạt chuẩn. Dừng, thông báo cho user, KHÔNG chạy chế độ ghi.
   - **1** — `CẦN NÂNG CẤP`, mọi lệch đều `[tự sửa]`: nêu tường minh trong phiên rằng sắp chạy chế độ GHI, rồi chạy lại **không cờ**:
     ```bash
     node "__ENGINE_PATH__"
     ```
     Sau đó đọc bối cảnh repo và cập nhật thông tin thực tế vào `project-intro.md`, `memory-distill.txt`, `index.md`.
   - **2** — có việc `[cần người]` (vd `BRN-016`: khối marker hỏng, hoặc vùng luật đã bị sửa tay): **DỪNG**. Báo cáo cho user kèm mã `BRN` và tên file. **TUYỆT ĐỐI KHÔNG tự sửa tay vùng luật do engine quản lý** (phần nằm giữa hai mốc `<!-- brain:rule:<id> -->`), KHÔNG xoá mốc, KHÔNG chép luật sang `CLAUDE.md`.
   - **3 / 64** — lỗi engine hoặc sai tham số: báo nguyên văn stderr cho user.

## Luật bất biến khi dùng lệnh này
- Ngoài vùng mốc `<!-- brain:rule:... -->` là **lãnh địa của người dùng** — engine không chạm, agent cũng không được chạm nhân danh engine.
- `CLAUDE.md` là shim ≤10 dòng trỏ `@AGENTS.md`; **CẤM** chép luật vào đó.
- Version KHUNG NÃO (`brain_template_version`) khác version DỰ ÁN (`current_version`) — tuyệt đối không trộn.
'@
    $cmdContent = $cmdTemplate.Replace('__ENGINE_PATH__', $enginePathForCmd)

    # -------------------------------------------------------------------------
    # B4. GHI — bỏ qua hoàn toàn khi -DryRun / -VerifyOnly
    # -------------------------------------------------------------------------
    if (-not $DryRun -and -not $VerifyOnly) {
        foreach ($name in $sources.Keys) {
            $destDir = Join-Path $GeminiSkillsRoot $name
            if (-not (Test-Path -LiteralPath $destDir -PathType Container)) {
                New-Item -Path $destDir -ItemType Directory -Force -ErrorAction Stop | Out-Null
            }
            Copy-Item -Path (Join-Path $sources[$name] '*') -Destination $destDir -Recurse -Force -ErrorAction Stop
        }
        if (-not (Test-Path -LiteralPath $ClaudeCommandsRoot -PathType Container)) {
            New-Item -Path $ClaudeCommandsRoot -ItemType Directory -Force -ErrorAction Stop | Out-Null
        }
        Write-Utf8NoBom -Path $cmdPath -Content $cmdContent
    }
    elseif ($DryRun) {
        Write-Host "DRY-RUN sẽ chép $($plan.Count) file vào '$GeminiSkillsRoot' và ghi file lệnh '$cmdPath'." -ForegroundColor DarkGray
        Write-Host ''
    }

    # -------------------------------------------------------------------------
    # B5. ĐỐI CHIẾU — LUÔN chạy (kể cả -DryRun / -VerifyOnly)
    # -------------------------------------------------------------------------
    Write-Row 'STATUS' 'SHA256(8)' 'REL'
    $match = 0; $diff = 0; $missing = 0
    foreach ($item in $plan) {
        $short = $item.SrcHash.Substring(0, 8).ToLower()
        if (-not (Test-Path -LiteralPath $item.Dest -PathType Leaf)) {
            $missing++
            Write-Row 'MISSING' $short $item.Rel
            continue
        }
        $destHash = (Get-FileHash -LiteralPath $item.Dest -Algorithm SHA256 -ErrorAction Stop).Hash
        if ($destHash -eq $item.SrcHash) {
            $match++
            Write-Row 'MATCH' $short $item.Rel
        }
        else {
            $diff++
            Write-Row 'DIFF' $short $item.Rel ('dest=' + $destHash.Substring(0, 8).ToLower())
        }
    }

    # File lệnh: không BOM, không byte 0x08, có đủ chuỗi mốc
    $cmdState = 'missing'
    if (Test-Path -LiteralPath $cmdPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($cmdPath)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $cmdState = 'bom'
        }
        elseif ($bytes -contains 0x08) {
            $cmdState = 'ctrl'
        }
        else {
            $text = [System.Text.Encoding]::UTF8.GetString($bytes)
            # Bánh cóc file lệnh: ngoài 'NÃO ĐÃ OK' + đường dẫn engine, BẮT BUỘC có
            # '--check' (Bước 0 chỉ đọc) và 'BRN-016' (nhánh [cần người], exit 2).
            # Thiếu bất kỳ mốc nào ⇒ file lệnh đã lạc hậu so với luật khung — chính là
            # cách file lệnh trôi lệch âm thầm suốt v1.4.0 mà không cổng nào bắt được.
            $requiredCmdTokens = @('NÃO ĐÃ OK', 'init_brain\.js', '--check', 'BRN-016')
            # KHÔNG đặt tên $missing — trùng biến đếm file thiếu ở dòng 148 (đã cắn một lần).
            $missingCmdTokens = @($requiredCmdTokens | Where-Object { $text -notmatch $_ })
            if ($missingCmdTokens.Count -gt 0) { $cmdState = "missing-token: $($missingCmdTokens -join ', ')" }
            else { $cmdState = 'ok' }
        }
    }
    if ($cmdState -eq 'ok') {
        Write-Row 'CMD-OK' '-' "$cmdName.md" "(no-BOM, no-0x08, has 'NÃO ĐÃ OK' · '--check' · 'BRN-016')"
    }
    else {
        Write-Row 'CMD-BAD' '-' "$cmdName.md" "($cmdState)"
    }

    # File THỪA ở đích — chỉ CẢNH BÁO, tuyệt đối KHÔNG xoá
    $extras = [System.Collections.Generic.List[string]]::new()
    foreach ($name in $sources.Keys) {
        $destDir = Join-Path $GeminiSkillsRoot $name
        if (Test-Path -LiteralPath $destDir -PathType Container) {
            $destDirFull = (Resolve-Path -LiteralPath $destDir).Path
            foreach ($file in (Get-ChildItem -LiteralPath $destDirFull -File -Recurse -Force -ErrorAction Stop)) {
                $rel = "$name/" + ((($file.FullName.Substring($destDirFull.Length)).TrimStart('\', '/')) -replace '\\', '/')
                if ($planRels -notcontains $rel) { $extras.Add($rel) }
            }
        }
    }
    if (Test-Path -LiteralPath $ClaudeCommandsRoot -PathType Container) {
        # Chỉ soi các file do chính deploy này từng sinh ra (kể cả bản đã bị vô hiệu hoá),
        # KHÔNG liệt kê toàn bộ kho lệnh cá nhân của người dùng.
        foreach ($file in (Get-ChildItem -LiteralPath $ClaudeCommandsRoot -File -Force -ErrorAction Stop)) {
            if ($file.FullName -eq $cmdPath) { continue }
            if ($file.Name -like 'compact*' -or $file.Name -like "$cmdName*") { $extras.Add($file.Name) }
        }
    }
    foreach ($extra in $extras) {
        Write-Row 'EXTRA' '-' $extra '# WARNING: có ở đích, không có ở nguồn — giữ nguyên'
    }

    $mismatch = $diff + $missing
    if ($cmdState -ne 'ok') { $mismatch++ }

    if ($DryRun) { $exit = 0 }
    elseif ($mismatch -gt 0) { $exit = 2 }
    else { $exit = 0 }

    Write-Host ('SUMMARY  files={0} match={1} diff={2} missing={3} extra={4} cmd={5} exit={6}' -f $plan.Count, $match, $diff, $missing, $extras.Count, $cmdState, $exit)

    # -------------------------------------------------------------------------
    # B6. Banner thành công — CHỈ khi thực sự đã chép VÀ đối chiếu khớp
    # -------------------------------------------------------------------------
    if ($exit -eq 0) {
        if ($DryRun) {
            Write-Host "`nℹ️ DRY-RUN: không ghi bất kỳ file nào." -ForegroundColor Gray
        }
        elseif ($VerifyOnly) {
            Write-Host "`n✅ ĐỐI CHIẾU KHỚP 100% — bản global đang đúng bằng bản hub." -ForegroundColor Green
        }
        else {
            Write-Host "`n===========================================================" -ForegroundColor Yellow
            Write-Host "🎉 HOÀN TẤT ĐỒNG BỘ TOÀN BỘ CÁC TRÌNH AI AGENT THÀNH CÔNG!" -ForegroundColor Yellow
            Write-Host "===========================================================`n" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "`n⛔ LỆCH: bản global KHÔNG bằng bản hub (exit=$exit). Xem SPEC-P03 (c) để xử lý." -ForegroundColor Red
    }
}
catch {
    $msg = $_.Exception.Message
    if (-not $msg.StartsWith('❌')) { $msg = "❌ $msg" }
    Write-Error $msg -ErrorAction Continue
    if ($exit -eq 0) { $exit = 3 }
}

exit $exit
