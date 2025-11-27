# Pour Windows (PowerShell)
# Crée une junction vers node_modules.win

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$Target = "node_modules.win"

# Supprimer le symlink/junction existant
if (Test-Path "node_modules") {
    $item = Get-Item "node_modules" -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        # C'est un symlink/junction - supprimer sans récursion
        cmd /c rmdir node_modules
    }
}

# Créer la junction (ne nécessite pas de droits admin)
if (Test-Path $Target) {
    cmd /c mklink /J node_modules $Target
    Write-Host "Switched to $Target"
} else {
    Write-Host "$Target not found. Run: pnpm install"
    exit 1
}
