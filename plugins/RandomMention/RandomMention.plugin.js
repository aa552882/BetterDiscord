//META{"name":"RandomMention","displayName":"RandomMention"}*//
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

var RandomMention = (() => {
    const config = {"info":{"name":"RandomMention","authors":[{"name":"aa55","discord_id":"853395505710628914"}],"version":"1.0.0","description":"A port from powercord's 'At-Someone', type @someone to mention a random user"}};

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

    const { Patcher, Logger, Settings, DiscordModules } = Library;

    const getMemberIds = BdApi.findModuleByProps("getMemberIds")
    const getLastSelectedGuildId = BdApi.findModuleByProps("getLastSelectedGuildId")

    return class RandomMention extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                amount: 1
            };
        }


        onStart() {
            Logger.log("Started");
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                this.handleMessage(a)});
        }

        fetchMembers() {
            return getMemberIds.getMemberIds(getLastSelectedGuildId.getLastSelectedGuildId());
        }

        handleMessage(message) {     
            let content = message[1].content
            if(!(content.includes("@someone"))) {
                return
            }
            let members = this.fetchMembers()
            let amount = (content.match(/@someone/g) || []).length;
            for(let i = 0; i<=amount;i++){
                if(content.length > 1950) {
                    BdApi.showToast("message is too long")
                    break
                }
                let newtext = ''
                for(let m = 0; m<this.settings.amount;m++){
                newtext += "<@" + members[Math.floor(Math.random() * members.length)] + ">"
                }
                content = content.replace("@someone", newtext)
                if(content.length > 1950) {
                    BdApi.showToast("message is too long")
                    break
                }
            }
                
            message[1].content = content
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("Link Cleaning Settings", {collapsible: true, shown: true}).append(
                    new Settings.Textbox("Amount", "Amount of people to ping with an '@someone'",this.settings.amount, e => { this.settings.amount = e; }),
                )
            );
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/