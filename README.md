# twc-2025

*This is a bundle for [NodeCG](https://nodecg.dev/); if you do not understand what that is, we advise you read their website first for more information.*

twc-2025 is a bundle for the [NodeCG](https://nodecg.dev/) broadcast graphics framework/application producing the [Touhou World Cup 2025](https://touhouworldcup.com) stream layouts. Internally, it leverages [nodecg-speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol) for match management.

Some basic information:
- Game and Category is determined by the Game name field in Speedcontrol only, for example "EoSD Lunatic Survival".
- The Speedcontrol timer is used for reset time.
- The "Text Control" Panel is used to set various information.
- Uses custom speedcontrol data to store match start time.

## WARNING: NO LICENSE

### **Using anything from this repository without permission will result in DMCA takedowns.**

All files in this repo are currently provided ALL RIGHTS RESERVED. There is no license granted beyond what's required to publicly display this repository on GitHub. You are free to learn from this code, even try setting up the NodeCG and OBS up yourself, but you are currently not allowed to use any assets from this repository for streams.

You are free to use the World Feed provided on [twitch.tv/touhouworldcup](https://twitch.tv/touhouworldcup) to produce unofficial restreams in accordance with Section 5.2 "Usage Guidelines for unofficial Restreams" of the [TWC Handbook](https://docs.google.com/document/d/e/2PACX-1vQrmgcwhgKARoUnk5BPE0Oyv4fAgHilZs1pUa1RQJtm0X_z93L8eI0lNt1Y-iZQK3v4_Ab9vx1HzpkN/pub#h.scgkjrx4iyzp).

## Setup

See [NODECG_SETUP.md](READMES/NODECG_SETUP.md) and [STREAM_SETUP](READMES/STREAM_SETUP.md) for setup guides.

## Development

- `git clone https://github.com/touhouworldcup/twc-2025`
- `cd twc-2025`
- `npm install && npm run build` 

With access to the TWC server, you can do a one-time login to the Samba fileshare (contact Maribel for details), after which you can perform `npm run deploy` to copy build output directly to the server for immediate deployment.