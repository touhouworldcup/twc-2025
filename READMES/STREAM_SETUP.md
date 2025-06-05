# Stream Setup

Once NodeCG is running, you can setup the OBS packages.

## Prerequisites

Both World Feed and English Stream require the installation of:
- [VLC Media Player](https://get.videolan.org/vlc/3.0.20/win64/vlc-3.0.20-win64.exe)
- [VB-CABLE Virtual Audio Device](https://download.vb-audio.com/Download_CABLE/VBCABLE_Driver_Pack45.zip)
- [VoiceMeeter Banana](https://download.vb-audio.com/Download_CABLE/VoicemeeterSetup_v2119.zip)
- [streamlink](https://github.com/streamlink/windows-builds/releases)
  - The internally distributed broadcast package comes with it's own bundled version of streamlink

All scene collections are 1920x1080.

## World Feed OBS Setup

- Import the World Feed scene collection
- Go through each browser source, and replace:
  - `NODECG_SITE_HERE` with your deployment site
  - `NODECG_KEY_HERE` with your user key from NodeCG (obtainable from the dashboard)
- Set your OBS Websocket port to 4456 and your OBS websocket password to the "obs-websocket-password" string from `cfg/twc-2025.json`

Use the INPUT PLAYER 1-3 scenes to capture streams by using the VLC or Web- sources.

You will likely want to download Stage Background videos from [Dai Karasu](https://www.youtube.com/@Dai_karasu) for use on the Match Card scenes.

## English Stream OBS Setup

- Install the font "Perpetua Titling". This repo does not distribute it, so you must obtain it yourself
- Install the [Audio Monitor](https://obsproject.com/forum/resources/audio-monitor.1186/) OBS plugin
- Import the English Stream scene collection
- Go to the "OBS Controller" browser source, and replace:
  - `NODECG_SITE_HERE` with your deployment site
  - `NODECG_KEY_HERE` with your user key from NodeCG (obtainable from the dashboard)
- Go through each VDO Browser source, and replace:
  - `YOUR_VDO_ROOM` with your VDO ninja room ID
  - `YOUR_VDO_PASSWORD` with your VDO ninja password
  - `COMMENTATOR_N_VDO_ID` with your commentator 1-4 VDO stream IDs
- Go through each VDO audio source, and set it to the corrosponding Voicemeeter 1-4 output devices
- Set your OBS Websocket port to 4455 and your OBS websocket password to the "obs-websocket-password" string from `cfg/twc-2025.json`

To open the world feed, run the following streamlink command: `streamlink --twitch-low-latency --twitch-disable-ads --player-args "--width=640 --height=360 --no-autoscale" twitch.tv/touhouworldcup best`

## Music playback / Now Playing

To setup music playback with automatic Now Playing for the English Stream:

- Install [foobar2000](https://www.foobar2000.org/)
- Install [ReplayGain DSP](https://www.foobar2000.org/components/view/foo_dsp_replaygain)
- Install [Beefweb Remote Control](https://www.foobar2000.org/components/view/foo_beefweb)
- Configure Beefweb (see [Beefweb Advanced configuration](https://github.com/hyperblast/beefweb/blob/master/docs/advanced-config.md) for config file location):
```
{
    "port": 8880,
    "allowRemote": false,
    "responseHeaders": {
        "Access-Control-Allow-Origin": "*"
    }
}
```