import { Hooks } from './hooks.js';

export class Utils {
	constructor() {
		this._hooks = new Hooks();
	}

	addOptions() {
		ig.lang.labels.sc.gui.options['dontResetTimerOnDeath'] = {name: 'Don\'t reset timer on death', description: 'Don\'t reset timer on death. \\c[1]WARNING: This will affect the actual IGT!'};
		ig.lang.labels.sc.gui.options['printEvents'] = {name: 'Print all events', description: 'Print all possible events that can be split on. Use "Log level: Default"'};
		ig.lang.labels.sc.gui.options.headers['ccTimer'] = 'CCTimer';

		                     // arg0 - name 
		sc.OPTIONS_DEFINITION['dontResetTimerOnDeath'] = {
			// arg1 - type
			type: 'CHECKBOX',
			// arg2 - init
			init: true,
			// arg3 - category
			cat: 0,
			// arg4 - data
			// arg5 - restart
			restart: true,
			// arg6 - header
			hasDivider: true,
			header: 'ccTimer'
		};
							   // arg0 - name 
		sc.OPTIONS_DEFINITION['printEvents'] = {
			// arg1 - type
			type: 'CHECKBOX',
			// arg2 - init
			init: false,
			// arg3 - category
			cat: 0,
			// arg4 - data
			// arg5 - restart
			restart: true,
			// arg6 - header
		};

		this._hooks.hookStatsSet((val, stats) => {
			if(sc.options.get('dontResetTimerOnDeath') 
				&& stats 
				&& stats.player 
				&& stats.player.playtime 
				&& val 
				&& val.player 
				&& val.player.playtime) {
				val.player.playtime = stats.player.playtime;
			}
		});
	}

	/**
	 * 
	 * @param {import('./connectionManager').ConnectionManager} connection
	 */
	updateTime(connection) {
		ig.game.addons.postUpdate.push({
				onPostUpdate() {
				const t = sc.stats.getStat('player', 'playtime');
				if(!t) {
					return;
				}
					
				connection.sendIgt(t);
			}
		});
	}

	printEvents() {
		this._hooks.hookVarSet((path, value) => {
			if (sc.options.get('printEvents') && value !== ig.vars.get(path)) {
				// eslint-disable-next-line no-console
				console.log('event', path, '=', value);
			}
		});

		this._hooks.hookLoadMap(() => {
			if (sc.options.get('printEvents')) {
				// eslint-disable-next-line no-console
				console.log('loadmap', 'Entered map', cc.ig.getMapName());
			}
		});

		this._hooks.hookEnemyHP((name, hp) => {
			if (sc.options.get('printEvents')) {
				// eslint-disable-next-line no-console
				console.log('damage', name, hp);
			}
		});
	}
}

Utils.log = (...args) => {
	if (window.logTimer) {
		console.log(...args);
	}
};