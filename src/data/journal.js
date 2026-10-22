// Keep saved journal history intact; shorten its presentation, including old saves.
const SHORT_NOTES = [
  [/try for a Broadway audition|Goal:.*audition/i, 'Try the Broadway audition.'],
  [/Broadway.*Lafayette.*station|Next destination:.*Lafayette/i, 'Go to Broadway–Lafayette.'],
  [/squirrel.*newspaper/i, 'The newspaper is in my backpack.'],
  [/Met a retired busker/i, 'Met the Brooklyn busker.'],
  [/retired busker in Brooklyn|busker.*may help/i, 'Find the busker in Brooklyn.'],
  [/underground neighborhood is Ratlantis/i, 'This place is Ratlantis.'],
  [/entry pipe.*too high|entry pipe.*unreachable/i, 'The entry pipe is out of reach.'],
  [/Skill learned: singing/i, 'Learned to sing.'],
  [/Ferry ticket received/i, 'Ferry ticket: ask for the rat with the mop.'],
  [/Skill learned: dancing/i, 'Learned to dance. Go to Queens.'],
  [/Skill learned: acting/i, 'Learned to act. Follow the pipes to Manhattan.'],
  [/pipe leads to an open vent|Reached the audition-room vent/i, 'Found the audition-room vent.'],
];
export function shortJournalNote(text) {
  return SHORT_NOTES.find(([pattern])=>pattern.test(text))?.[1] || text;
}
export function journalNotes(state) {
  return [...new Set(state.journal.map(shortJournalNote))];
}
