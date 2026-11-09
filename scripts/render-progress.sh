#!/bin/zsh
# 조각 렌더 진행률: 끝난 일 / 전체 일, 돌고 있는 조각은 끝난 조각 평균 시간으로 추정 (2026-10-27 사용자: "얼마 남았는지 퍼센트로")
# sh scripts/render-progress.sh [폴더 out/ep1en]
D=${1:-out/ep1en}
cd "$(dirname "$0")/.."
total=$(grep -c . "$D/jobs.txt")
done_n=$(grep -c "끝$" "$D/progress.txt" 2>/dev/null)
start=$(stat -f %m "$D/jobs.txt"); now=$(date +%s)
# 화면 조각은 소리보다 훨씬 무거움: 소리 1개 = 조각 0.3개로 셈
vid_total=$((total - 2)); vid_done=$(grep -c "^조각 .* 끝$" "$D/progress.txt" 2>/dev/null); aud_done=$(grep -cE "^(voice|bed) 끝$" "$D/progress.txt" 2>/dev/null)
running=$(ps aux | grep "[r]emotion-cli.js render" | grep -c "$D/part-")
# 끝난 조각의 평균 시간 (로그 파일 만든 때 → mp4 마지막 수정)
avg=0; n=0
for f in $D/part-*.mp4(N); do
  k=${${f:t:r}#part-}; k=$((10#$k)); lg="$D/part-$k.log"
  [[ -f $lg ]] || continue
  t=$(( $(stat -f %m $f) - $(stat -f %B $lg) )); avg=$((avg + t)); n=$((n + 1))
done
(( n > 0 )) && avg=$((avg / n)) || avg=600
partial=0
for lg in $D/part-*.log(N); do
  k=${${lg:t:r}#part-}; [[ -f $D/part-$(printf %02d $k).mp4 ]] && continue
  e=$(( now - $(stat -f %B $lg) )); p=$(( e * 100 / avg )); (( p > 95 )) && p=95; partial=$((partial + p))
done
units_total=$(( vid_total * 100 + 2 * 30 ))
units_done=$(( vid_done * 100 + partial + aud_done * 30 ))
pct=$(( units_done * 100 / units_total ))
left=$(( (vid_total - vid_done) * avg / 2 - partial * avg / 200 )); (( left < 0 )) && left=0
el=$(( now - start ))
printf "%d%%  (화면 조각 %d/%d 끝, 지금 %d개 렌더 중, 소리 %d/2)  지난 시간 %d분  남은 시간 약 %d분\n" $pct $vid_done $vid_total $running $aud_done $((el / 60)) $((left / 60))
grep -q 전부끝 "$D/progress.txt" 2>/dev/null && echo "전부 끝남"; true
