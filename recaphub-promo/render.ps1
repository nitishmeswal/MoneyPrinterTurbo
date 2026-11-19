# Render the RecapHub promo films.
#   powershell -File recaphub-promo\render.ps1                       # final: all 12, motion blur, audio mastered to -16 LUFS
#   powershell -File recaphub-promo\render.ps1 Launch Shorts         # just these
#   powershell -File recaphub-promo\render.ps1 -Draft Launch         # draft: no motion blur, quicker, out\draft\
# Outputs: recaphub-promo\out\recaphub-<film>.mp4 (final) or out\draft\<film>.mp4
[CmdletBinding(PositionalBinding = $false)]
param([switch]$Draft, [int]$Samples = 6, [Parameter(ValueFromRemainingArguments = $true)][string[]]$Films)
$here = $PSScriptRoot
$ff = Join-Path (Split-Path $here) '.venv\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
if (-not $Films) { $Films = 'Launch','Teaser','Shorts','Story','Pages','Press','Intel','Mcp','Live','Drive','Analytics','Publish' }
$outDir = if ($Draft) { Join-Path $here 'out\draft' } else { Join-Path $here 'out' }
New-Item -ItemType Directory -Force $outDir | Out-Null
$props = Join-Path $outDir '_props.json'
if ($Draft) { '{}' | Set-Content $props -Encoding ascii } else { "{`"mb`":true,`"samples`":$Samples}" | Set-Content $props -Encoding ascii }
Push-Location "$here\motion"
foreach ($f in $Films) {
  $t0 = Get-Date
  $raw = Join-Path $outDir "_$($f.ToLower())-raw.mp4"
  $final = if ($Draft) { Join-Path $outDir "$($f.ToLower()).mp4" } else { Join-Path $outDir "recaphub-$($f.ToLower()).mp4" }
  $crf = if ($Draft) { 22 } else { 16 }
  & .\node_modules\.bin\remotion.cmd render src/index.ts $f $raw --codec h264 --crf $crf --concurrency 8 --gl=angle "--props=$props" --log=error 2>&1 | Select-Object -Last 2
  if (-not (Test-Path $raw)) { "FAILED render $f"; continue }
  # audio master: -16 LUFS integrated, -1.5 dBTP (clear, not loud); picture copied untouched
  & $ff -v error -y -i $raw -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k -movflags +faststart $final
  if (Test-Path $final) { Remove-Item $raw; "done {0}  ({1:N0}s)" -f $final, ((Get-Date) - $t0).TotalSeconds } else { "FAILED master $f" }
}
Remove-Item $props -ErrorAction SilentlyContinue
Pop-Location
