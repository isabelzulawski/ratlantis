import test from 'node:test';
import assert from 'node:assert/strict';
import {journalNotes} from '../src/data/journal.js';
import {plotThought} from '../src/data/plot-thoughts.js';
test('old journal notes become brief without modifying saved history',()=>{
 const state={journal:['Met a retired busker in Brooklyn.','Ferry ticket received. Note on the back: “Ask for the rat with the mop.” Follow the ferry boarding passage at the right of the Brooklyn alcove.','Reached the audition-room vent.','The pipe leads to an open vent overlooking the audition room.']};
 const original=state.journal.slice(),notes=journalNotes(state);
 assert.deepEqual(state.journal,original);
 assert.deepEqual(notes,['Met the Brooklyn busker.','Ferry ticket: ask for the rat with the mop.','Found the audition-room vent.']);
 assert.ok(notes.includes('Met the Brooklyn busker.'));
 assert.ok(notes.includes('Ferry ticket: ask for the rat with the mop.'));
 assert.ok(notes.every(n=>n.length<65));
});
test('plot reminders describe current events without unlearned destination hints',()=>{
 const state={flags:{}};
 assert.ok(!/Brooklyn|ferry|Queens|vent/i.test(plotThought(state,'neighborhood')));
 assert.ok(!/Manhattan|vent|pipes/i.test(plotThought(state,'queens')));
 assert.match(plotThought(state,'sewer'),/boat/);
 state.flags.brooklyn=true;
 assert.match(plotThought(state,'neighborhood'),/Brooklyn/);
});
