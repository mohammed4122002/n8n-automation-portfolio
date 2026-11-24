#!/usr/bin/env bash
# Generates royalty-free sound effects + a background music loop with ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
S=public/sfx; M=public/music
ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# whoosh: filtered noise sweep
ff -f lavfi -i "anoisesrc=d=0.6:c=pink:a=0.8" -af "highpass=f=300,lowpass=f=4000,afade=t=in:d=0.25,afade=t=out:st=0.3:d=0.3,volume=1.4" $S/whoosh.mp3
# click: short tick
ff -f lavfi -i "sine=f=2200:d=0.04" -af "afade=t=out:st=0.005:d=0.035,volume=0.8" $S/click.mp3
# pop: pitch-drop blip
ff -f lavfi -i "aevalsrc='sin(2*PI*(900-6000*t)*t)*exp(-25*t)':d=0.15" -af volume=0.9 $S/pop.mp3
# ding / success: two bell tones
ff -f lavfi -i "aevalsrc='0.5*sin(2*PI*1318*t)*exp(-4*t)+0.4*sin(2*PI*1975*t)*exp(-4*(t-0.12))*gt(t,0.12)':d=1.2" $S/success.mp3
# notification: soft double chime
ff -f lavfi -i "aevalsrc='0.5*sin(2*PI*880*t)*exp(-8*t)+0.5*sin(2*PI*1175*t)*exp(-8*(t-0.15))*gt(t,0.15)':d=0.8" $S/notification.mp3
# typing: 12 random-ish key ticks
ff -f lavfi -i "aevalsrc='0.6*sin(2*PI*1800*t)*exp(-120*mod(t,0.09))*lt(mod(t,0.09),0.03)*(0.6+0.4*sin(37*t))':d=1.1" -af "highpass=f=800" $S/typing.mp3
# riser: rising sweep for builds
ff -f lavfi -i "aevalsrc='0.4*sin(2*PI*(200*t+400*t*t))*(t/2)':d=2" -af "afade=t=out:st=1.85:d=0.15" $S/riser.mp3
# impact / boom
ff -f lavfi -i "aevalsrc='0.9*sin(2*PI*(80-40*t)*t)*exp(-5*t)':d=1" -af "lowpass=f=300,volume=1.6" $S/impact.mp3
# error buzz
ff -f lavfi -i "aevalsrc='0.4*(2*gt(sin(2*PI*140*t),0)-1)*exp(-4*t)':d=0.45" -af "lowpass=f=1500" $S/error.mp3
# transition swish (reverse whoosh)
ff -i $S/whoosh.mp3 -af areverse $S/swish.mp3

# background music: 16s ambient loop (Am - F - C - G pads + soft kick)
ff -f lavfi -i "aevalsrc='\
0.10*(sin(2*PI*220*t)+sin(2*PI*261.6*t)+sin(2*PI*329.6*t))*lt(mod(t,16),4)+\
0.10*(sin(2*PI*174.6*t)+sin(2*PI*220*t)+sin(2*PI*261.6*t))*gte(mod(t,16),4)*lt(mod(t,16),8)+\
0.10*(sin(2*PI*261.6*t)+sin(2*PI*329.6*t)+sin(2*PI*392*t))*gte(mod(t,16),8)*lt(mod(t,16),12)+\
0.10*(sin(2*PI*196*t)+sin(2*PI*246.9*t)+sin(2*PI*293.7*t))*gte(mod(t,16),12)+\
0.35*sin(2*PI*55*t)*exp(-12*mod(t,0.5))':d=16" \
  -af "lowpass=f=2500,aecho=0.8:0.7:250:0.25,afade=t=in:d=1,afade=t=out:st=15:d=1,volume=0.9" $M/ambient-loop.mp3

ls -la $S $M
