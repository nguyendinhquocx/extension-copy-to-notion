# AI Experts Setup Script
# Usage: .\setup-ai-experts.ps1 [target-project-path]
# chỉ cần chạy: Copy-Item "D:\pcloud\code\ai\Prompt AI NguyenX\.ai-experts" ".ai-experts" -Recurse

param(
    [Parameter(Mandatory=$false)]
    [string]$TargetPath = "."
)

Write-Host "🚀 Setting up AI Experts in project..." -ForegroundColor Green

# Get current script directory (where .ai-experts folder is)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$SourceDir = Join-Path $ScriptDir ".ai-experts"

# Target directory
$TargetDir = Join-Path $TargetPath ".ai-experts"

# Check if source exists
if (-not (Test-Path $SourceDir)) {
    Write-Host "❌ Error: .ai-experts folder not found in $ScriptDir" -ForegroundColor Red
    exit 1
}

# Create target directory
if (Test-Path $TargetDir) {
    $choice = Read-Host "⚠️  .ai-experts already exists in target. Overwrite? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "❌ Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
    Remove-Item $TargetDir -Recurse -Force
}

# Copy .ai-experts folder
Copy-Item $SourceDir $TargetDir -Recurse
Write-Host "✅ Copied .ai-experts folder to $TargetDir" -ForegroundColor Green

# Setup .gitignore
$GitignoreFile = Join-Path $TargetPath ".gitignore"
$GitignoreTemplate = Join-Path $TargetDir ".gitignore-template"

if (Test-Path $GitignoreTemplate) {
    if (Test-Path $GitignoreFile) {
        $addToGitignore = Read-Host "📝 Add .ai-experts to existing .gitignore? (Y/n)"
        if ($addToGitignore -ne "n" -and $addToGitignore -ne "N") {
            Add-Content $GitignoreFile "`n# AI Experts (added by setup script)`n.ai-experts/"
            Write-Host "✅ Added .ai-experts to .gitignore" -ForegroundColor Green
        }
    } else {
        Copy-Item $GitignoreTemplate $GitignoreFile
        Write-Host "✅ Created .gitignore with AI experts ignore rules" -ForegroundColor Green
    }
}

Write-Host "`n🎉 AI Experts setup complete!" -ForegroundColor Green
Write-Host "📖 Read .ai-experts/README.md for usage instructions" -ForegroundColor Cyan
Write-Host "`n💡 Example usage:" -ForegroundColor Yellow
Write-Host "   @read .ai-experts/Chuyên gia thiết kế.md" -ForegroundColor White
Write-Host "   Then ask: 'Design architecture for my e-commerce app'" -ForegroundColor White
