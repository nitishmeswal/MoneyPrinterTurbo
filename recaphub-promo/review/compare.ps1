# Side by side: a stretch of one of our films next to a stretch of the Teamble reference, same length, for
# judging timing and easing at full speed (stills can't show either).
#   powershell -File recaphub-promo\review\compare.ps1 launch 17.5 22.0 4
#     -> review\compare-launch-17.5.mp4: ours from 17.5 s on the left, the reference from 22.0 s on the right, 4 s long
param([string]$Film, [double]$Ours, [double]$Ref, [double]$Dur = 4)
$root = Split-Path $PSScriptRoot
$repo = Split-Path $root
$ff = Join-Path $repo '.venv\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
$a = Join-Path $root "out\recaphub-$Film.mp4"
$b = Join-Path $repo 'flayel-videos\Best-SaaS-Product-SnapYT.App.mp4'
$out = Join-Path $PSScriptRoot "compare-$Film-$Ours.mp4"
& $ff -v error -y -ss $Ours -t $Dur -i $a -ss $Ref -t $Dur -i $b -filter_complex "[0:v]scale=960:540,setsar=1[l];[1:v]scale=960:540,setsar=1[r];[l][r]hstack=inputs=2[v]" -map "[v]" -map 0:a? -c:v libx264 -crf 18 -c:a aac $out
"compare -> $out"
