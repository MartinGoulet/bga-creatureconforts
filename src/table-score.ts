class TableScore {
   constructor(private game: CreatureComforts) {
      if (game.gamedatas.gamestate.name !== 'gameEnd') return;
      this.displayScores(game.gamedatas.scores);
   }

   displayScores(scores: Record<number, any>) {
      document.querySelectorAll('.players-scores').forEach((table: HTMLTableElement) => table.remove());
      const player_ids = this.game.gamedatas.playerorder.map((id) => Number(id));
      const html = `<table class="players-scores">
            <thead>
               ${this.getHeaderNames(player_ids, this.game.gamedatas)}
            </thead>
            <tbody>
               ${this.getRow('comforts', _('Comforts'), player_ids, scores)}
               ${this.getRow('comforts_bonus', _('Bonus'), player_ids, scores)}
               ${this.getRow('improvements', _('Improvements'), player_ids, scores)}
               ${this.getRow('improvements_bonus', _('Bonus'), player_ids, scores)}
               ${this.getRow('cottages', _('Cottages'), player_ids, scores)}
               ${this.getRow('', _('Resources'), player_ids, scores)}
               ${this.getRow('stories', _('Stories'), player_ids, scores)}
               ${this.getRow('coins', _('Coins'), player_ids, scores)}
               ${this.getRow('goods', _('Resources'), player_ids, scores)}
               ${this.getTotals(player_ids, scores)}
            </tbody>
         </table>`;

      debugger;
      document.getElementById('table-score').insertAdjacentHTML('afterbegin', html);
   }

   private getHeaderNames(player_ids: number[], { players }: CreatureComfortsGamedatas) {
      const colums = player_ids.map((id) => {
         const { color, name } = players[id];
         return `<th style="color: #${color}">${name}</th>`;
      });

      return `<tr id="score-headers">
         <th></th>
         ${colums.join('')}
      </tr>`;
   }

   private getTotals(player_ids: number[], scores: Record<number, any>) {
      const colums = player_ids.map((pId) => {
         const player_scores = scores[pId];
         const total = Object.keys(player_scores)
            .filter((key) => key !== 'total')
            .reduce((prev, curr) => {
               return prev + Number(player_scores[curr]);
            }, 0);
         return `<td>
            <div id="score-${pId}-total">${total}</div>
            <i class="fa fa-star"></id>
         </td>`;
      });

      return `<tr id="scores-row-total">
         <td class="row-header">${_('Total')}</td>
         ${colums.join('')}
      </tr>`;
   }

   private getRow(row: string, title: string, player_ids: number[], scores: Record<number, any>) {
      const columns = player_ids.map((pId) => {
         if (row === '') return `<td></td>`;

         const score = scores[pId][row];
         return `<td>
            <div id="score-${pId}-${row}">${score}</div>
            <i class="fa fa-star"></id>
         </td>`;
      });

      return this.getScoreRow(row, title, columns);
   }

   private getScoreRow(id: string, title: string, columns: string[]) {
      return `<tr id="scores-row-${id}">
         <td class="row-header">${title}</td>
         ${columns.join('')}
      </tr>`;
   }
}
