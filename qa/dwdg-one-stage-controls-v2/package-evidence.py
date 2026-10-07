from pathlib import Path
import json
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
film = json.loads((root / 'tooltip-film.json').read_text())
frames = [Image.open(f['file']).convert('RGB').crop((650, 245, 1180, 800)) for f in film]
durations = [max(20, film[i + 1]['timestamp'] - f['timestamp']) if i + 1 < len(film) else 300 for i, f in enumerate(film)]
frames[0].save(root / 'tooltip-animation.gif', save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=False)

sheet = Image.new('RGB', (1000, 2000), '#e9ecef')
draw = ImageDraw.Draw(sheet)
clips = {1440:(670, 316, 905, 775), 1024:(598, 316, 833, 775), 390:(10, 380, 245, 840), 320:(10, 380, 245, 840)}
for row, width in enumerate([1440, 1024, 390, 320]):
    for col, (lang, theme) in enumerate([('en', 'light'), ('en', 'dark'), ('id', 'light'), ('id', 'dark')]):
        draw.text((col * 250 + 8, row * 500 + 8), f'{width}px / {lang} / {theme}', fill='#17212b')
        shot = Image.open(root / f'{lang}-{theme}-{width}.png').crop(clips[width])
        sheet.paste(shot, (col * 250 + 8, row * 500 + 32))
sheet.save(root / 'menu-review-sheet.png')
