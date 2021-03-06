'use strict';

const { Broadcast: B } = require('ranvier');
const alertAreaWithDistance = require('../lib/alertAreaWithDistance');

module.exports = {
  name: 'Accuse',

  cooldown: {
    group: 'detective',
    length: 15
  },

  options: {
    invalidArgsMessage: 'Who are you accusing?',
    invalidRoleMessage: 'Who are you to accuse anyone?',
    noOneHereMessage: 'There is no one else here... paranoid much?',
    requiredRole: 'detective',
    targetNotFoundMessage: `There is no one called '%name%' here. Perhaps a figment of your imagination?`,
  },

  requiresTarget: true,

  run: (state) => (args, player, target) => {
    const targetCodename = target.metadata.name;
    const playerCodename = player.metadata.name;
    B.sayAt(player, `You accuse ${targetCodename} of being a replicant!`);
    alertAreaWithDistance(state, player, 'a scanner firing');

    // Handle the consequences of the accusation.
    if (target.metadata.role === 'replicant') {
      B.sayAt(player, `They must be a replicant! Your scanner <red>melts</red> them down to a puddle of goo.`);
      if (!target.isNpc) {
        B.sayAt(target, `${playerCodename} fires their scanner at you! You're doomed!`);
      }
      B.sayAtExcept(player.room, `${playerCodename} fires their scanner at ${targetCodename}. ${targetCodename} melts into a gooey pile of machinery!`, [player, target]);
      player.emit('point');
      target.emit('death');
    } else {
      // TODO: Player cannot accuse for 30s
      B.sayAt(player, `Having wrongly accused ${targetCodename}, your replicant scanner <red>malfunctions!</red>`);
      target.emit('point');
      player.emit('point', -1);
      if (!target.isNpc) {
        B.sayAt(target, `${playerCodename} <red>fires</red> their scanner at you! It starts to malfunction.`);
      }
      B.sayAtExcept(player.room, `${playerCodename} <red>fires</red> their scanner at ${targetCodename}. The scanner starts emitting sparks as it refuses to melt an organic human!`, [player, target]);
      target.emit('accused', player);
    }
  }
};
