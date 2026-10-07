import {startExperience} from './experience-startup.mjs';

await startExperience(()=>import('./experience.mjs'),document);
