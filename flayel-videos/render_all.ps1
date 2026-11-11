# Render every pack that has a motion spec (or a list you pass), one after another.
#   powershell -File flayel-videos\render_all.ps1                 # all in kling\motion.json
#   powershell -File flayel-videos\render_all.ps1 pov/1 myth/2    # just these
$Packs = @($args)
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
if ($Packs.Count -eq 0) {
    $spec = Get-Content "$PSScriptRoot\kling\motion.json" -Raw -Encoding UTF8 | ConvertFrom-Json
    $Packs = $spec.PSObject.Properties.Name | Where-Object { $_ -notlike '_*' }
}
$i = 0
foreach ($p in $Packs) {
    $i++
    $start = Get-Date
    & .\.venv\Scripts\python.exe flayel-videos\make_video.py $p --render 2>&1 | Out-Null
    $ok = if ($LASTEXITCODE -eq 0) { 'ok' } else { "FAILED ($LASTEXITCODE)" }
    "[{0}/{1}] {2} {3} in {4:n0}s" -f $i, $Packs.Count, $p, $ok, ((Get-Date) - $start).TotalSeconds
}
