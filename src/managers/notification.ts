class NotificationManager {
   constructor(private game: CreatureConforts) {}

   setup() {
      const notifs: [string, number][] = [['onDiscardStartHand', 1000]];

      notifs.forEach(([eventName, duration]) => {
         dojo.subscribe(eventName, this, (notifDetails: INotification<any>) => {
            debug(`notif_${eventName}`, notifDetails.args);

            const promise = this[`notif_${eventName}`](notifDetails.args);

            // tell the UI notification ends, if the function returned a promise
            promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
         });
         this.game.notifqueue.setSynchronous(eventName, duration);
      });

      if (isDebug) {
         notifs.forEach((notif) => {
            if (!this[`notif_${notif[0]}`]) {
               console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
            }
         });

         Object.getOwnPropertyNames(CreatureConforts.prototype)
            .filter((item) => item.startsWith('notif_'))
            .map((item) => item.slice(6))
            .forEach((item) => {
               if (!notifs.some((notif) => notif[0] == item)) {
                  console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
               }
            });
      }

      this.game.notifqueue.setIgnoreNotificationCheck(
         'message',
         (notif) => notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
      );
   }

   // private subscribeEvent(eventName: string, time?: number, setIgnore = false) {
   //    try {
   //       dojo.subscribe(eventName, this, 'notif_' + eventName);
   //       if (time) {
   //          this.game.notifqueue.setSynchronous(eventName, time);
   //       }
   //       if (setIgnore) {
   //          this.game.notifqueue.setIgnoreNotificationCheck(
   //             eventName,
   //             (notif) =>
   //                notif.args.excluded_player_id && notif.args.excluded_player_id == this.game.player_id,
   //          );
   //       }
   //    } catch {
   //       console.error('NotificationManager::subscribeEvent', eventName);
   //    }
   // }

   private async notif_onDiscardStartHand(args: DiscardStartHandArgs) {
      await this.game.tableCenter.discardConfort.addCard(args.card);
   }
}

interface DiscardStartHandArgs {
   player_id: number;
   card: Confort;
}
