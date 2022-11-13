//META{"name":"NoReplyNotifications","displayName":"NoReplyNotifications"}*//
/*@cc_on
@if (@_jscript)
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

var NoReplyNotifications = (() => {
    const config = {"info":{"name":"NoReplyNotifications","authors":[{"name":"aa55","discord_id":"853395505710628914"}],"version":"1.0.0","description":"Suppress reply notifications coming from other people"}};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            const title = "Library Missing";
            const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
            const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
            const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
            if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
            ModalStack.push(function(props) {
                return BdApi.React.createElement(ConfirmationModal, Object.assign({
                    header: title,
                    children: [BdApi.React.createElement(TextElement, {color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
                    red: false,
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }, props));
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const { Patcher, Logger, Settings } = Library;

    return class NoReplyNotifications extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                dmsenabled: true,
                whitelist:"",
                minlen:2001
            };
        }


        onStart() {
            Logger.log("Started");
            const NotificationModule = BdApi.Webpack.getModule(BdApi.Webpack.Filters.byProps("showNotification"));
            BdApi.Patcher.before("NoReplyNotifications", NotificationModule, "showNotification", (_, args) => {this.handlenotifications(args)});
            this.update();
        }

        handlenotifications(args) {
            let WhitelistedUsers = this.settings.whitelist.split(' ')
            if(WhitelistedUsers.includes(args[3].notif_user_id)) {
                return
            }
            if(!(args[3].guild_id) && this.settings.dmsenabled == false){
                return
            }
            console.log(this.settings.minlen, args[2].length <= this.settings.minlen)
            if(args[3].message_type == 19 && args[2].length <= this.settings.minlen){
                  args[4].volume = 0.0
            }
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("Notification Settings", {collapsible: false, shown: true}).append(
                    new Settings.Switch("Enable in dms", "Whether you want to suppress reply notifications in dms too or not.",
                        this.settings.dmsenabled, e => { this.settings.dmsenabled = e; }),
                    new Settings.Textbox("Whitelisted users", "List of users who won't get suppressed (user ids separated by a space, example: 853395505710628914 853395505710628914)",this.settings.whitelist, e => { this.settings.whitelist = e; }),
                    new Settings.Textbox("Minimum message length", "The minimum length of a message needed to send a notification min:0, max:2000 (any message shorter than this won't send a notification, set to 2001 to suppress any message length)",this.settings.minlen, e => { this.settings.minlen = e; })
                )
            );
        }

        update() {this.initialized = true}

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/