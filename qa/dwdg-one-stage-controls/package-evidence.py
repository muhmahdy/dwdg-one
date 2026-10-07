from pathlib import Path
import json
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
film = json.loads((root / 'film.json').read_text())
frames = [Image.open(item['file']).convert('RGB').crop((650, 240, 1160, 750)) for item in film]
durations = [max(20, film[i + 1]['timestamp'] - item['timestamp']) if i + 1 < len(film) else 220 for i, item in enumerate(film)]
frames[0].save(root / 'completed-light-sweep.gif', save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=False)

sheet = Image.new('RGB', (4 * 250, 4 * 470), '#e9ecef')
draw = ImageDraw.Draw(sheet)
clips = {1440: (670, 315, 905, 738), 1024: (598, 315, 833, 738), 390: (10, 385, 245, 808), 320: (10, 400, 245, 823)}
for row, width in enumerate([1440, 1024, 390, 320]):
    for col, (lang, theme) in enumerate([('en', 'light'), ('en', 'dark'), ('id', 'light'), ('id', 'dark')]):
        draw.text((col * 250 + 8, row * 470 + 8), f'{width}px / {lang} / {theme}', fill='#17212b')
        image = Image.open(root / f'{lang}-{theme}-{width}.png').crop(clips[width])
        sheet.paste(image, (col * 250 + 8, row * 470 + 36))
sheet.save(root / 'menu-review-sheet.png')
