import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The density type scale (text-d13 …) and the type-* shorthands are font sizes too, so they must replace each other.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ['d8h', 'd9h', 'd10', 'd10h', 'd11', 'd11h', 'd12', 'd12h', 'd13', 'd13h', 'd14', 'd14h', 'd15', 'd15h', 'd16', 'd17', 'd18', 'd19', 'd20', 'd22', 'd24', 'd28', 'd32'] },
    classGroups: { 'font-size': [{ type: ['display', 'title', 'h2', 'h3', 'body', 'small', 'caption', 'num'] }] },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
