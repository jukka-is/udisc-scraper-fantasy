const app = Vue.createApp({
  data() {
    return {
      players: [],
      teams: [],
      status: 'initial'
    };
  },
  watch: {
    players(data) {
      this.updateTeams(data);
    }
  },
  methods: {
    updateTeams(players) {
      const teamNames = [...new Set(players.map(player => player.team))];
      this.teams = teamNames.map(teamName => {
        return {
          name: teamName,
          players: players
            .filter(player => player.team === teamName)
            .sort((a, b) => b.points - a.points)
        };
      });
      this.updateIncludedPlayers();
    },
    updateIncludedPlayers() {
      this.teams = this.teams.map(team => {
        let fiCounter = 0;
        team.players = team.players.map((player, index) => {
          if ('fi' === player.category) {
            fiCounter++;
            player.included = fiCounter <= 2 ? true : false;
          } else {
            player.included = index - fiCounter <= 4 ? true : false;
          }
          return player;
        });
        return team;
      });
    },
    calculateTotals(team) {
      let fiCounter = 0;
      const points = team.players.reduce((accumulator, player, index) => {
        if (player.category == 'fi') {
          fiCounter++;
          return fiCounter <= 2 ? accumulator + player.points : accumulator;
        } else {
          return index - fiCounter <= 4
            ? accumulator + player.points
            : accumulator;
        }
      }, (initialValue = 0));
      return this.displayPoints(points);
    },
    async getScores() {
      try {
        this.status = 'fetching';
        const response = await fetch('/.netlify/functions/udisc-scraper', {
          method: 'POST',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.players)
        });
        const json = await response.json();
        this.players = json.data;
        this.status = 'success';
      } catch {
        console.log("didn't go through");
        this.status = 'error';
      }
    },
    displayPoints(points) {
      return points <= 0 ? '-' : parseFloat(points).toFixed(2);
    },
    isFetching() {
      return 'fetching' == this.status ? true : false;
    }
  },
  async created() {
    const response = await fetch('./players.json');
    this.players = await response.json();
  }
});

app.mount('#app');
