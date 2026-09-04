#!/bin/sh
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  exec python3 launch.py
fi
printf '無法啟動，請先安裝 Python 3。\n'
printf '按 Enter 鍵關閉…'
read -r _
