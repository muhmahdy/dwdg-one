import { z } from 'zod';

/** `{ table: [ {id, pos, doc} ] }`: the rows of every table, as the database (or the server) sends them. */
export const rowsByTable = z.record(
  z.string(),
  z.array(z.object({ id: z.string(), pos: z.number(), doc: z.unknown() })),
);
