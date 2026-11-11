# Render and polish RecapHub films: raw Remotion render, then the EffectCraft finishing pass.
#   powershell -File recaphub-videos\render_all.ps1                 # every film
#   powershell -File recaphub-videos\render_all.ps1 shorts pages    # just these
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Films)
$root = Split-Path -Parent $PSScriptRoot
if (-not $Films) { $Films = 'teaser','shorts','story','pages','press','intel','mcp','live','drive','analytics','publish' }
$env:PYTHONIOENCODING = 'utf-8'
foreach ($f in $Films) {
  $id = $f.Substring(0,1).ToUpper() + $f.Substring(1)
  Push-Location "$root\recaphub-videos\motion"
  npx remotion render src/index.ts $id "..\out\$f-raw.mp4" --codec h264 --crf 14 2>&1 | Select-Object -Last 1
  Pop-Location
  & "$root\.venv\Scripts\python.exe" "$root\recaphub-videos\polish.py" $f | Select-Object -Last 1
}
