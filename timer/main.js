import { IngameDisplay } from './ingameDisplay.js';
import { ConnectionManager } from './connectionManager.js';
import { Config } from './config.js';
import { EventManager } from './eventManager.js';
import { Utils } from './utils.js';
import { StateManager } from './stateManager.js';

export default class CCTimer {
	constructor(mod) {
		this.mod = mod;
	}
    
	poststart() {
		const utils = this.utils = new Utils();
		utils.addOptions();
		utils.printEvents();

		const ingameDisplay = this.ingameDisplay = new IngameDisplay();
		ingameDisplay.initialize();
		if (!window.require) {
			ingameDisplay.run();
			return;
		}

		const connection = this.connection = new ConnectionManager();
		connection.connect(() => this.setupLivesplit(), () => ingameDisplay.run());
	}
    
	async setupLivesplit() {
		Utils.log('[timer] Connected to livesplit');
		Utils.log('[timer] Loading config..');

		const config = new Config(this.mod);
		await config.load('settings.json');

		Utils.log('[timer] Loaded config: ', config);

		if (config.isIGT) {
			Utils.log('[timer] Using original ingame time');
			this.utils.updateTime(this.connection);
		} else {
			Utils.log('[timer] Using custom time filter');
			const stateManager = new StateManager();
			stateManager.filterStates(config.filter);
			stateManager.onStateChanged(running => this.connection.sendPaused(!running));
		}

		Utils.log('[timer] Hooking events for splits..');
		const events = new EventManager();
		events.onstart = () => this.connection.sendStart();
		events.onsplit = () => this.connection.sendSplit();
		events.onunload = () => this.connection.sendPaused(false);
		events.start(config);
		Utils.log('[timer] Hooked events');
	}
}