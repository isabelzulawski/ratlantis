// Present-tense context only: no unlearned destinations, costume hints or puzzle solutions.
export function plotThought(state, scene) {
  if (scene === 'street') return state.flags.audition
    ? 'A Broadway audition. I want to give it a try.'
    : 'That enormous billboard caught my eye.';
  if (scene === 'park') return state.flags.map
    ? 'Broadway–Lafayette. That sounds like my stop.'
    : 'A little farther downtown. Maybe someone here knows Broadway.';
  if (['station','ride','arrivalStation'].includes(scene)) return 'Broadway–Lafayette sounded promising. Let’s see where this takes me.';
  if (scene === 'sewer') return 'I fell through a drain and landed in a boat. Where am I?';
  if (scene === 'neighborhood') return state.flags.brooklyn
    ? 'The dockworker mentioned a busker in Brooklyn. I could use some help.'
    : 'A whole neighborhood down here. I should ask where I’ve landed.';
  if (['bridge','brooklyn'].includes(scene)) return state.flags.singing
    ? 'I can sing now. One step closer to that audition.'
    : 'I’m looking for the busker. I need to find my voice.';
  if (scene === 'ferry') return state.flags.dancing
    ? 'I found the rhythm. Time to keep going.'
    : 'The busker’s ticket got me aboard. This deck has quite a sway.';
  if (scene === 'queens') return state.flags.acting
    ? 'Singing, dancing, acting. I’ve come a long way from that pizza.'
    : 'A little theater. I still need to learn how to act.';
  if (scene === 'auditionPipe' || scene === 'vent') return 'Back toward Manhattan. I’m following the warm light.';
  return 'That must be the audition room.';
}
