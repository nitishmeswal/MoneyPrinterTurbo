# Contact sheet per film: two moments per shot (40% and 85% through it).
#   powershell -File scripts\sheets.ps1 Teaser Pages ...
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Films)
$env:FFMPEG = 'C:\Users\nitis\Desktop\MoneyPrinterTurbo\.venv\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
$plan = @{
  Teaser = @(140, @(0, 8, 18, 24, 30, 36, 42, 50))
  Shorts = @(140, @(0, 20, 32, 46, 52, 60, 76, 84))
  Story = @(128, @(0, 10, 24, 38, 54, 70, 84, 104, 112))
  Pages = @(136, @(0, 8, 20, 30, 38, 50, 60, 76, 84))
  Press = @(132, @(0, 10, 20, 32, 42, 50, 56, 72, 80))
  Intel = @(126, @(0, 10, 22, 32, 44, 56, 72, 80))
  Mcp = @(142, @(0, 8, 20, 30, 44, 56, 72, 80))
  Live = @(144, @(0, 10, 22, 36, 48, 60, 76, 84))
  Drive = @(134, @(0, 10, 20, 32, 44, 56, 72, 80))
  Analytics = @(138, @(0, 8, 20, 34, 44, 52, 68, 76))
  Publish = @(124, @(0, 10, 34, 58, 84, 104, 112))
}
foreach ($f in $Films) {
  $bpm = $plan[$f][0]; $b = $plan[$f][1]; $spb = 60.0 / $bpm
  $times = @()
  for ($i = 0; $i -lt $b.Count - 1; $i++) {
    $a = $b[$i] * $spb; $d = ($b[$i + 1] - $b[$i]) * $spb
    $times += [math]::Round($a + 0.4 * $d, 2); $times += [math]::Round($a + 0.85 * $d, 2)
  }
  node scripts\stills.mjs $f "..\out\$($f.ToLower())-sheet.png" @times 2>&1 | Select-Object -Last 1
}
