# Panel Forge — Leonida Cover Lab

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/xwb529/gta6-cover-art-01-panel-forge/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/xwb529/gta6-cover-art-01-panel-forge/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your own photo and a caption into multi-panel, GTA-poster-style cover art, exported as a PNG. Your photos never leave your machine.

## What it does

- **Three panel layouts** — Classic Five, Sunset Strips, Neon Grid — the multi-panel poster look, not a single tinted photo.
- **Any photo, every panel** — fill all panels with one photo in one click, or give each panel its own photo; drag on the preview to reposition a panel's photo, zoom it with its slider.
- **Four colour grades** — Vice Sunset, Neon Nights, Leonida Gold, Noir Mono — painted straight onto the canvas.
- **Bold poster lettering** — your own caption, stacked and stroked with a hard magenta shade, plus a subtitle line. Original lettering only: no Rockstar logos, artwork or fonts.
- **Fast to a PNG** — export at 1080 × 1080, 1080 × 1350 or 1920 × 1080. Photo → cover in under a minute.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Or serve `app/` with any static file server. It works fully offline.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`, unchanged from the kit).

## License

MIT — see `LICENSE`. The two sample photos in `app/samples/` were made for make.fun with an image model and are free to use.
