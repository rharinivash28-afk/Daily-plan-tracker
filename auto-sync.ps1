# auto-sync.ps1
# Watches the project for file changes and auto-commits + pushes to GitHub.
# Cloudflare Pages (once connected to GitHub) then auto-deploys each push.
#
# Usage:  Right-click -> "Run with PowerShell"   OR   run:  .\auto-sync.ps1
# Stop:   press Ctrl+C in the window.

$ErrorActionPreference = "Stop"
$repo = $PSScriptRoot
Set-Location $repo

Write-Host "=== Daily Tracker auto-sync ===" -ForegroundColor Cyan
Write-Host "Watching: $repo" -ForegroundColor DarkGray
Write-Host "Any saved change -> commit + push to GitHub -> Cloudflare auto-deploys." -ForegroundColor DarkGray
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

# Files/dirs we never want to trigger on (already in .gitignore, but be safe).
$ignore = @('node_modules', 'dist', '.git')

$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = $repo
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true

# Debounce: collect changes, then commit once things settle.
$script:lastChange = $null

$onChange = {
    $path = $Event.SourceEventArgs.FullPath
    foreach ($i in $using:ignore) {
        if ($path -like "*\$i\*" -or $path -like "*\$i") { return }
    }
    $script:lastChange = Get-Date
}

Register-ObjectEvent $fsw Changed -Action $onChange | Out-Null
Register-ObjectEvent $fsw Created -Action $onChange | Out-Null
Register-ObjectEvent $fsw Deleted -Action $onChange | Out-Null
Register-ObjectEvent $fsw Renamed -Action $onChange | Out-Null

$debounceSeconds = 3

try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($null -ne $script:lastChange) {
            $elapsed = (Get-Date) - $script:lastChange
            if ($elapsed.TotalSeconds -ge $debounceSeconds) {
                $script:lastChange = $null

                # Only act if there are real changes git cares about.
                $status = git status --porcelain
                if (-not [string]::IsNullOrWhiteSpace($status)) {
                    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    Write-Host "[$stamp] Change detected -> committing..." -ForegroundColor Yellow
                    git add -A
                    git commit -m "Auto-save: $stamp" | Out-Null
                    Write-Host "[$stamp] Pushing to GitHub..." -ForegroundColor Yellow
                    git push origin main
                    Write-Host "[$stamp] Synced. Cloudflare will deploy shortly." -ForegroundColor Green
                    Write-Host ""
                }
            }
        }
    }
}
finally {
    Get-EventSubscriber | Unregister-Event
    $fsw.Dispose()
    Write-Host "auto-sync stopped." -ForegroundColor Cyan
}
