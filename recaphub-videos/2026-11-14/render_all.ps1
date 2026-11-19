# Render RecapHub films (2026-11-14 set) and master the audio to -18 LUFS (the reference sits at -19.5).
#   powershell -File recaphub-videos\2026-11-14\render_all.ps1                 # all 11
#   powershell -File recaphub-videos\2026-11-14\render_all.ps1 Shorts Pages    # just these
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Films)
$here = $PSScriptRoot
$ff = Join-Path (Split-Path (Split-Path $here)) '.venv\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
if (-not $Films) { $Films = 'Teaser','Shorts','Story','Pages','Press','Intel','Mcp','Live','Drive','Analytics','Publish' }
Push-Location "$here\motion"
foreach ($f in $Films) {
  $raw = "..\out\$($f.ToLower())-raw.mp4"
  $final = "..\out\recaphub-$($f.ToLower()).mp4"
  npx remotion render src/index.ts $f $raw --codec h264 --crf 16 --concurrency 6 2>&1 | Select-Object -Last 1
  & $ff -v error -y -i $raw -c:v copy -af "loudnorm=I=-18:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart $final
  if (Test-Path $final) { Remove-Item $raw; "done $final" } else { "FAILED $f" }
}
Pop-Location
