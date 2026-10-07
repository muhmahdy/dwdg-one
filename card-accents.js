// Sample starting positions are chosen only once, keeping motion continuous.
const accentPalettes = [
  ['#ffc4b3', '#a6c8ec', '#ff9e70'],
  ['#f7d881', '#b6c6a4', '#ffeaba'],
  ['#b4cfbf', '#b8d4f0', '#ffd0ae'],
];
const randomBetween = (min, max) => min + Math.random() * (max - min);
const thumbnails = [];
document.querySelectorAll('.project').forEach((project, index) => {
  const oldIcon = project.querySelector('.project-icon');
  const heading = document.createElement('div');
  heading.className = 'project-heading';
  const thumbnail = document.createElement('div');
  thumbnail.className = 'project-thumbnail';
  thumbnail.dataset.palette = index % accentPalettes.length;
  thumbnail.setAttribute('aria-hidden', 'true');
  accentPalettes[index % accentPalettes.length].forEach((color, shapeIndex) => {
    const shape = document.createElement('span');
    shape.className = 'gradient-shape';
    const anchors = [[-8, -9], [34, 2], [8, 43]];
    const [x, y] = anchors[shapeIndex];
    const variables = {
      '--blob-color': color,
      '--duration': `${randomBetween(18, 30).toFixed(2)}s`,
      '--phase': `${-randomBetween(0, 30).toFixed(2)}s`,
      '--x1': `${x + randomBetween(-7, 7)}px`,
      '--y1': `${y + randomBetween(-7, 7)}px`,
      '--x2': `${x + randomBetween(-17, 17)}px`,
      '--y2': `${y + randomBetween(-17, 17)}px`,
      '--s1': randomBetween(.85, 1.05),
      '--s2': randomBetween(1.05, 1.2),
    };
    Object.entries(variables).forEach(([key, value]) => shape.style.setProperty(key, value));
    thumbnail.append(shape);
  });
  thumbnail.append(oldIcon.querySelector('svg'));
  oldIcon.remove();
  const copy = document.createElement('div');
  copy.append(project.querySelector('h3'), project.querySelector('p'));
  heading.append(thumbnail, copy);
  project.querySelector('.project-top').after(heading);
  thumbnails.push(thumbnail);
});
const visibleThumbnails = new Set();
function updateAccentPlayback() {
  thumbnails.forEach(thumbnail => thumbnail.classList.toggle('is-visible',
    !document.hidden && visibleThumbnails.has(thumbnail)));
}
const accentObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleThumbnails.add(entry.target);
    else visibleThumbnails.delete(entry.target);
  });
  updateAccentPlayback();
});
thumbnails.forEach(thumbnail => accentObserver.observe(thumbnail));
document.addEventListener('visibilitychange', updateAccentPlayback);
