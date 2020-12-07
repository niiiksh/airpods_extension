
const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;



const PopupMenuExample = new Lang.Class({
	Name: 'PopupMenuExample',	// Class Name
	Extends: PanelMenu.Button,	// Parent Class

	// Constructor
	_init: function () {
		/* 
		This is calling the parent constructor
		1 is the menu alignment (1 is left, 0 is right, 0.5 is centered)
		`PopupMenuExample` is the name
		true if you want to create a menu automatically, otherwise false
		*/
		this.parent(1, 'PopupMenuExample', false);

		// We are creating a box layout with shell toolkit
		let box = new St.BoxLayout();

		this.icon = new St.Icon({ icon_name: 'AirpodL', style_class: 'system-status-icon' });
		this.icon1 = new St.Icon({ icon_name: 'AirpodR', style_class: 'system-status-icon' });
		this.icon2 = new St.Icon({ icon_name: 'airpods_case', style_class: 'system-status-icon' });
		// A label expanded and center aligned in the y-axis
		this.leftAP_label = new St.Label({
			text: ' 0 ',
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER
		});
		this.rightAP_label = new St.Label({
			text: ' 0 ',
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER
		});
		this.caseBat_label = new St.Label({
			text: ' 0 ',
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER
		});
		this.tryConnect = true;

		// We add the icon, the label and a arrow icon to the box
		box.add(this.icon);
		box.add(this.leftAP_label);
		box.add(this.icon1);
		box.add(this.rightAP_label);
		box.add(this.icon2);
		box.add(this.caseBat_label);

		//box.add(PopupMenu.arrowIcon(St.Side.BOTTOM));

		this.actor.add_child(box);

		this.switchmenuitem = new PopupMenu.PopupSwitchMenuItem('Auto-Connect', this.tryConnect);
		let imagemenuitem = new PopupMenu.PopupImageMenuItem('Disconnect AirPods', 'airpods_disconnected');

		this.menu.addMenuItem(this.switchmenuitem);
		
		//this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		this.menu.addMenuItem(imagemenuitem);

		this.switchmenuitem.connect('toggled', Lang.bind(this, function (object, value) {
			if (value) {
				//label.set_text('On');
				this._tryConnect();
			} else {
				//label.set_text('Off');
				this._stopConnect();
			}
		}));
		//this.switchmenuitem.setToggleState(true);

		/*
		With Popup*MenuItem you can use the signal `activate`, it is fired when the user clicks over a menu item
		*/
		imagemenuitem.connect('activate', Lang.bind(this, function () {
			GLib.spawn_command_line_async("./disconnect.py");
			this._stopConnect();
			this.switchmenuitem.setToggleState(false);
		}));

		/*
		With 'open-state-changed' on a popupmenu we can know if the menu is being shown
		We will just show the submenu menu items automatically, (by default it is not shown)
		*/
		// this.menu.connect('open-state-changed', Lang.bind(this, function(){
		// 	popupMenuExpander.setSubmenuShown(true);
		// }));
		this._refresh();

	},

	_batteryPercent: function (num) {
		if (num === '--% ') {
			return num;
		}
		if (num <= 10) {
			return Math.min((num * 10) + 5, 100) + '% ';
		}
	},

	_stopConnect: function () {
		this.tryConnect = false;
	},
			
	_tryConnect: function () {
		this.tryConnect = true;
	},

	_refresh: function () {
		GLib.spawn_command_line_async("./runscan.py");
		let batteryData = String(GLib.file_get_contents("/home/nikita/airpods_battery.txt")[1]);
		
		global.log(batteryData);
		var indicators = batteryData.split(',');
		for (var i = 0; i < indicators.length && i < 3; i++)
			if (indicators[i] == '' || indicators[i] == '15')
				indicators[i] = '--% ';

		let leftAP = this._batteryPercent(indicators[0]);
		let rightAP = this._batteryPercent(indicators[1]);
		let caseBat = this._batteryPercent(indicators[2]);

		let chargeL = indicators[3];
		let chargeR = indicators[4];
		let chargeCase = indicators[5];

		if (chargeL === 'True') {
			this.icon.icon_name = 'AirpodL_charge';
		}
		else {
			this.icon.icon_name = 'AirpodL';
		}
		if (chargeR === 'True') {
			this.icon1.icon_name = 'AirpodR_charge';
		}
		else {
			this.icon1.icon_name = 'AirpodR';
		}
		if (chargeCase === 'True') {
			this.icon2.icon_name = 'airpods_case_charge';
		}
		else {
			this.icon2.icon_name = 'airpods_case';
		}

		if (indicators.length < 7)
			leftAP = rightAP = caseBat = chargeL = chargeR = chargeCase = '--% ';
		else if (indicators.length === 7 && this.tryConnect)
			GLib.spawn_command_line_async("./connect.py");

		this.leftAP_label.set_text(' ' + leftAP + ' ');
		this.rightAP_label.set_text(' ' + rightAP + ' ');
		this.caseBat_label.set_text(' ' + caseBat + ' ');

		this._removeTimeout();
		this._timeout = Mainloop.timeout_add_seconds(3, Lang.bind(this, this._refresh));
		return true;
	},

	_removeTimeout: function () {
		if (this._timeout) {
			Mainloop.source_remove(this._timeout);
			this._timeout = null;
		}
	},

	stop: function () {
		if (this._timeout)
			Mainloop.source_remove(this._timeout);
		this._timeout = undefined;
	},

	destroy: function () {
		/*
		This call the parent destroy function
		*/
		this.parent();
	}
});

let button3;

function init(extensionMeta) {
	let theme = imports.gi.Gtk.IconTheme.get_default();
	theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
	button3 = new PopupMenuExample;
	Main.panel.addToStatusArea('PopupMenuExample', button3, 0, 'right');
}

function disable() {
	button3.stop();
	button3.destroy();
}
