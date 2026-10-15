import {startExperience} from './experience-startup.mjs';

await startExperience(()=>import('../shell/experience.mjs'),document);
