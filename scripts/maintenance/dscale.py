"""Rewrites literal Tailwind font sizes (text-[12px]) to the density scale (text-d12) in the given files.
Comfortable raises every step of the scale (tokens.css --fs-*), so text that follows the prototype's generated Comfortable
rules must use the scale, not a fixed pixel size. Sizes outside the scale (avatar initials) are left alone."""
import re, sys
SCALE = {'10': 'd10', '10.5': 'd10h', '11': 'd11', '11.5': 'd11h', '12': 'd12', '12.5': 'd12h', '13': 'd13', '13.5': 'd13h',
         '14': 'd14', '14.5': 'd14h', '15': 'd15', '15.5': 'd15h', '16': 'd16', '17': 'd17', '18': 'd18', '19': 'd19', '20': 'd20',
         '22': 'd22', '24': 'd24', '28': 'd28', '32': 'd32'}
rx = re.compile(r'text-\[(\d+(?:\.\d+)?)px\]')
for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    n = rx.sub(lambda m: f'text-{SCALE[m.group(1)]}' if m.group(1) in SCALE else m.group(0), s)
    if n != s:
        open(path, 'w', encoding='utf-8').write(n)
        print('rewrote', path)
