/* The competency framework of the matrix: what an analyst is rated on, and the five levels. No imports, so the demo seed can
   read it too. A proposal (v0.1) until HR and Consulting Knowledge agree on it, like the monitoring rubric. The competencies
   follow the Consulting brief's "minimum consulting language": problem structuring, research, analysis, solution development,
   feasibility and client communication, plus slides and project management. */

export interface Competency {
  k: string;
  /** Full name, shown in the profile panel. */
  name: string;
  /** Column heading in the matrix. */
  short: string;
  desc: string;
}

export const FRAMEWORK = {
  version: 'v0.1',
  proposed: true,
  competencies: [
    {
      k: 'structuring',
      name: 'Problem structuring',
      short: 'Structuring',
      desc: 'Breaks a client question into an issue tree and hypotheses',
    },
    {
      k: 'research',
      name: 'Research',
      short: 'Research',
      desc: 'Desk research and interviews with sources others can check',
    },
    {
      k: 'analysis',
      name: 'Analysis',
      short: 'Analysis',
      desc: 'Turns data into findings with spreadsheets or statistics',
    },
    {
      k: 'solution',
      name: 'Solution development',
      short: 'Solution',
      desc: 'Builds options and a recommendation from the findings',
    },
    {
      k: 'feasibility',
      name: 'Feasibility and financials',
      short: 'Feasibility',
      desc: 'Tests options on cost, revenue and risk',
    },
    {
      k: 'decking',
      name: 'Slides and writing',
      short: 'Slides',
      desc: 'Storyline, slides and reports to the DWDG standard',
    },
    {
      k: 'client',
      name: 'Client communication',
      short: 'Client',
      desc: 'Leads meetings, workshops and updates with a client',
    },
    {
      k: 'pm',
      name: 'Project management',
      short: 'PM',
      desc: 'Keeps a workplan, roles and deadlines for a team',
    },
  ] as Competency[],
};

/** Levels 0 to 4: label and what it means. */
export const LEVELS: readonly [label: string, meaning: string][] = [
  ['Not yet', 'Has not done it yet'],
  ['Basic', 'Knows the idea, for example from a module'],
  ['With guidance', 'Has done it with someone senior checking'],
  ['Independent', 'Does it alone to the agreed standard'],
  ['Can teach', 'Reviews and coaches others'],
];

/** The level from which a member can be staffed on a competency without someone senior beside them. */
export const READY = 3;

export const COMPETENCY_KEYS = FRAMEWORK.competencies.map((c) => c.k);
