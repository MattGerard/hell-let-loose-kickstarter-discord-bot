/*
  A discord bot to scrape the HLL kickstarter Campaign
*/

//import lodash & axios
const _ = require('lodash');
const axios = require('axios');

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'YOUR_TOKEN_HERE';

//GOALS
const goals = [
  {
    amount: 140000,
    name: 'Deployable Mortars',
  },
  {
    amount: 152500,
    name: 'Foy Map',
  },
  {
    amount: 165250,
    name: 'Flamethrowers',
  },
  {
    amount: 178100,
    name: 'Hurtgen Forest Map',
  },
  {
    amount: 190800,
    name: 'Light Tanks',
  },
  {
    amount: 203550,
    name: 'Utah Beach Map',
  },
  {
    amount: 216270,
    name: 'Mobile Artillery',
  },
  {
    amount: 229000,
    name: 'Carentan Map',
  },
  {
    amount: 241700,
    name: 'Strafing Run Call-In',
  },
  {
    amount: 254440,
    name: 'Armored Recovery Vehicles',
  },
  {
    amount: 267000,
    name: 'St Mere Eglise Map',
  },
  {
    amount: 279900,
    name: 'Deployable Anti-Personnel Minefields',
  },
  {
    amount: 296163,
    name: 'Marvie Map',
  },
  {
    amount: 309040,
    name: 'Scout Vehicles',
  },
  {
    amount: 321917,
    name: 'Dismemberment',
  },
  {
    amount: 334793,
    name: 'Deployable Flak Cannons',
  },
  {
    amount: 347670,
    name: 'Winter uniforms for both German and US forces',
  },
  {
    amount: 360546,
    name: 'Flamethrower tank variant for German and US forces',
  },
  {
    amount: 373423,
    name: 'Drivable civilian vehicles (bicycle, truck, town-car)',
  },
  {
    amount: 386300,
    name: 'Early war Ostfront German forces',
  },
  {
    amount: 515066,
    name: 'Russian Forces including 2 Eastern Front maps',
  },
  {
    amount: 643833,
    name: 'British Forces including 2 Operation Market Garden maps',
  },
  {
    amount: 772599,
    name: 'Canadian Forces including 2 Falaise Pocket maps',
  },
  {
    amount: 901365,
    name: 'Japanese Forces including 2 Pacific Theatre maps',
  },
];

//store the globalamount that we keep track of to push updates
let globalAmount = 0;

//format some numbers with commas
function numberWithCommas(x) {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Get the next goal ucoming, not currently using this, but feel free to play with it in the messaging.
// function getNextGoal(goals, amount) {
//   for (let i = 0; i < goals.length; i++) {
//     if (goals[i].amount > amount) {
//       return goals[i];
//     }
//   }
// }

//Get the completed goals
function getCompleteGoals(amount) {
  const goalsCompleted = [];
  for (let i = 0; i < goals.length; i++) {
    if (goals[i].amount < amount) {
      goalsCompleted.push(goals[i]);
    }
  }
  return goalsCompleted;
}

//Get the non-completed goals
function getNonCompleteGoals(amount) {
  const goalsCompleted = [];
  for (let i = 0; i < goals.length; i++) {
    if (goals[i].amount > amount) {
      goalsCompleted.push(goals[i]);
    }
  }
  return goalsCompleted;
}

//Find the message in the discord channel, edit it if its there, if not - add a new message
function findKSMessage(hllinfochannel, message, amount) {
  hllinfochannel
    .fetchMessages({limit: 1})
    .then(messages => {
      if (amount !== globalAmount) {
        globalAmount = amount;
        const m = messages.first();
        const equal = message === m;
        if (m) {
          m.edit(message);
        } else {
          hllinfochannel.send(message);
        }
      }
    })
    .catch(console.error);
}

//Get the data from kickstarter, then build our message
function startKickerstarter() {
  //find the discord channels you want to update, name your channel hll-kickstarter, or whatever - needs to be here.
  const hllinfochannel = client.channels.find('name', 'hll-kickstarter');

  //Get the data from kickstarter
  axios
    .get('https://www.kickstarter.com/projects/blackmatter/hell-let-loose/stats.json?v=1')
    .then(res => {
      //define some variables to use below
      let goalsStatus = '';
      let nonCompleted = '';
      const amount = Number(res.data.project.pledged);
      // const nextGoal = getNextGoal(goals, amount);
      const completedGoals = getCompleteGoals(amount);
      const uncompletedGoals = getNonCompleteGoals(amount);

      //build messaging for completed
      for (const goal in completedGoals) {
        goalsStatus +=
          '$' +
          numberWithCommas(completedGoals[goal].amount) +
          ': ' +
          completedGoals[goal].name +
          ' ✔️ \n';
      }

      //build messaging for non-completed
      for (const goal in uncompletedGoals) {
        goalsStatus +=
          '$' +
          numberWithCommas(uncompletedGoals[goal].amount) +
          ': [' +
          uncompletedGoals[goal].name +
          ']\n';
      }

      //combine them into a message, awkward formatting is for discord markdown rendering.
      const message = `\`\`\`css
Pledged Amount: $${numberWithCommas(amount.toFixed())} AUD

${goalsStatus}\`\`\``;

      //find and send the message
      findKSMessage(hllinfochannel, message, amount);
      //init the loop
      getKsLoop();
    })
    .catch(error => {
      console.log({error});
    });
}

//loop function to keep things going
function getKsLoop() {
  setTimeout(function() {
    startKickerstarter();
  }, 60000 * 5);
}

// bot is ready - do it!
client.on('ready', () => {
  getKsLoop();
});

// Log our bot in
client.login(token);
