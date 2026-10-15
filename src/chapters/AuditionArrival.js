import { learn } from '../state.js';

// A visible, connected ending: service pipe → lit grille → room beyond.
// No human performers or resolution of the player's misunderstanding.
export class AuditionArrival {
  constructor(scene) { this.s = scene; }
  setup() {
    const s = this.s;
    this.opening = false;
    if (s.id === 'vent') {
      this.grille = s.add.image(795, 450, 'art-grille', 'door')
        .setOrigin(0, .5).setDisplaySize(375, 170).setDepth(16)
        .setInteractive({useHandCursor:true});
      s.bindObject(this.grille, () => {
        if (s.player.body.center.x > 600) this.open();
      });
      this.grille.setDepth(16);
    }
    if (s.id === 'auditionRoom') {
      document.querySelector('.hint')?.remove();
      // Give the room time to settle in view; no fade-to-black or modal ending.
      s.time.delayedCall(2200, () => this.caption());
    }
  }
  update() {
    const s = this.s;
    if (s.id === 'vent' && s.player.body.center.x > 760 && !s.locked) this.open();
    if (s.id === 'auditionRoom' && s.player.body.center.x < 60)
      s.transitionTo('vent', [650, 485]);
  }
  open() {
    const s = this.s;
    if (this.opening || s.id !== 'vent') return;
    this.opening = true;
    s.freeze();
    this.grille.disableInteractive();
    s.tweens.add({
      targets:this.grille, displayWidth:12, angle:-4, duration:1100,
      ease:'Sine.easeInOut',
      onComplete:()=>{
        s.state.flags.ventOpened = true;
        s.persist();
        s.transitionTo('auditionRoom');
      },
    });
  }
  caption() {
    const s = this.s;
    if (s.id !== 'auditionRoom') return;
    learn(s.state, 'auditionRoomReached', 'The pipe leads to an open vent overlooking the audition room.');
    learn(s.state, 'finished', 'Reached the audition-room vent.');
    s.persist();
    const card = document.createElement('aside');
    card.className = 'ending-caption';
    card.setAttribute('aria-label','End of Level One');
    card.innerHTML = '<p>End of Level One</p><button>Return to Ratlantis</button>';
    for (const event of ['pointerdown','pointerup','mousedown','mouseup','click'])
      card.addEventListener(event, e=>e.stopPropagation());
    card.querySelector('button').onclick = ()=>{s.ui.clear();s.enter('neighborhood');};
    document.body.append(card);
    this.card = card;
  }
  cleanup() {
    this.card?.remove();this.card=null;
    this.grille=null;this.opening=false;
  }
}
