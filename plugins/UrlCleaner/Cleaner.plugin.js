//META{"name":"UrlCleaner","displayName":"Url_Cleaner"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
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

var UrlCleaner = (() => {
    const config = {"info":{"name":"UrlCleaner","authors":[{"name":"aa55","discord_id":"853395505710628914"}],"version":"1.0.0","description":"Clean referrals and other unneeded stuff that urls often contain."}};

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

    const { Logger, DiscordModules, Patcher, Settings } = Library;

    return class UrlCleaner extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {
                shortyt: true,
                vxtwitter:true,
                shortds:true,
                escapechar:"\\"
            };
        }

        cleanLink(link, youtubeShortenEnabled, vxTwitterEnabled, shortdsEnabled) {
            try {
                var oldLink = new URL(link)
            } catch (e) {
                if (e instanceof TypeError) {
                    try{
                    var oldLink = new URL(link.split(/"(?:[^\\"]|\\.)*"/)[1].trim())}
                catch(TypeError){return link}
                }
            }
            if ((oldLink.host === 'href.li')) {
                var hrefLink = oldLink.href.split('?')[1]
                var oldLink = new URL(hrefLink)
            }
            var newLink = new URL(oldLink.origin + oldLink.pathname)
            if(oldLink.host.includes('discord.com') && oldLink.pathname.slice(1) == "invite" && shortdsEnabled) {
                newLink.pathname = oldLink.pathname.split('/')[2]
                newLink.host = "discord.gg"
            }
            if (oldLink.searchParams.has('q')) {
                newLink.searchParams.append('q', oldLink.searchParams.get('q'))
            }
            if (oldLink.host.includes('youtube.com') && oldLink.searchParams.has('v')) {
                newLink.searchParams.append('v', oldLink.searchParams.get('v'))
                newLink.searchParams.append('t', oldLink.searchParams.get('t'))
            }
            if (oldLink.host.includes('youtube.com') && youtubeShortenEnabled) {
                newLink.host = 'youtu.be'
                newLink.pathname = '/' + oldLink.searchParams.get('v')
                newLink.searchParams.delete('v')
            }
            if (oldLink.host.includes('twitter.com') && vxTwitterEnabled) {
                newLink.host = 'vxtwitter.com'
            }
            return newLink.toString()
        }

        onStart() {
            Logger.log("Started");
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                if(this.settings.ownregex == undefined){
                    var regex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)}
                else{
                    var regex = new RegExp(this.settings.ownregex);
                }
                if (content.match(regex)) {
                    content.match(regex).forEach(element => {
                    if(this.settings.escapechar == undefined || this.settings.escapechar == "\\"){if(content.split(element)[0].endsWith("\\")){return}}
                    else{if(content.split(element)[0].endsWith(this.settings.escapechar)){return}}
                    content = content.replace(element, this.cleanLink(element, this.settings.shortyt, this.settings.vxtwitter, this.settings.shortds))
                })
                a[1].content = content;
                }
                });

            this.update();
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("Link Cleaning Settings", {collapsible: false, shown: true}).append(
                    new Settings.Switch("Shorten youtube urls", "Convert youtube.com links into youtu.be links.",
                        this.settings.shortyt, e => { this.settings.shortyt = e; }),
                    new Settings.Switch("Use vxtwitter", "VxTwitter works better for embedded twitter links, clicking on the link will redirect to the original url.",
                        this.settings.vxtwitter, e => { this.settings.vxtwitter = e; }),
                    new Settings.Switch("Shorten discord urls", "Sometimes discord urls contain unnecessary stuff in them, such as discord.com/invite/hello rather than discord.gg/hello. Use this to automatically shorten them.",
                        this.settings.shortds, e => { this.settings.shortds = e; }),
                    new Settings.Textbox("Use own regex", "Use your own url regex. (only modify if you know what you're doing)",this.settings.ownregex, e => { this.settings.ownregex = e; }),
                    new Settings.Textbox("Escape char", "The charachter to put before urls to skip cleaning, leave empty to use default(\\)",this.settings.escapechar, e => { this.settings.escapechar = e; }),
                )
            );
        }

        update() {this.initialized = true}

        getChatTextArea() {
            return $(".slateTextArea-1bp44y");
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/