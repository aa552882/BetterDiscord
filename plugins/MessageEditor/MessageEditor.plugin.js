//META{"name":"MessageEditor","displayName":"MessageEditor"}*//
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

var MessageEditor = (() => {
    const config = {"info":{"name":"MessageEditor","authors":[{"name":"aa55","discord_id":"853395505710628914"}],"version":"1.0.0","description":"Edit other people's messages locally"}};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {}
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

            const { Logger} = Library;
            const {ContextMenu} = BdApi;

    return class MessageEditor extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
        }

        setAttributes(element, attributes) {
            Object.keys(attributes).forEach(attr => {
              element.setAttribute(attr, attributes[attr]);
            });
          }

        onStart() {
            Logger.log("Started");
            this.unpatch = ContextMenu.patch("message", (tree, props) => {
                
                let username = props.message.author.username
                    let id = props.message.id.toString()
                    let image = "https://cdn.discordapp.com/avatars/" + props.message.author.id.toString() + "/" + props.message.author.avatar
                    tree.props.children[2].props.children.push(
                     ContextMenu.buildItem({type: "separator"}),
                     ContextMenu.buildItem({label: "Edit Message", action: () => {
                        
                        BdApi.alert("")
                        document.querySelector(".content-2hZxGK.content-26qlhD.thin-31rlnD.scrollerBase-_bVAAt").remove()
                        const attributes1 = {"type": "text","id": "MsgAuthor","placeholder": "Messsage Author", "style":"width:400px;height:30px;text-align: center;color:white;background-color:transparent"}
                        const attributes2 = {"type": "url","id": "AvatarUrl","placeholder": "Avatar url", "style":"width:400px;height:30px;text-align: center;color:#89b4d7;background-color:transparent"}
                        const attributes3 = {"type": "text","id": "MsgContent","placeholder": "Message content", "style":"width:400px;height:30px;text-align: center;color:white;background-color:transparent"}
                        const attributes4 = {"type": "text","id": "MsgTimestamp","placeholder": "Message timestamp", "style":"width:400px;height:30px;text-align: center;color:white;background-color:transparent"}
                        let br = document.createElement("br");let br2 = document.createElement("br"); let br3 = document.createElement("br"); let br4 = document.createElement("br");
                        const hitext = document.querySelector(".defaultColor-24IHKz.heading-lg-medium-3gUJeM.defaultColor-HXu-5n");
                        let input = document.createElement('INPUT');let input2 = document.createElement('INPUT');let input3 = document.createElement('INPUT');let input4 = document.createElement('INPUT');
                        this.setAttributes(input, attributes1);
                        this.setAttributes(input2, attributes2);
                        this.setAttributes(input3, attributes3);
                        this.setAttributes(input4, attributes4);
                        hitext.append(input,br3,input2,br,input3,br2,input4,br4);
                        const okButton = document.querySelector(".button-f2h6uQ.lookFilled-yCfaCM.colorBrand-I6CyqQ.sizeMedium-2bFIHr.grow-2sR_-F");
                        okButton.addEventListener("click", () => {
                            const MsgAuthor = document.getElementById('MsgAuthor').value;
                            const AvatarUrl = document.getElementById('AvatarUrl').value;
                            const MsgContent = document.getElementById('MsgContent').value;
                            const MsgTimestamp = document.getElementById('MsgTimestamp').value;
                            const message = document.getElementById(`chat-messages-${id}`);
                            const messsage_content = document.querySelector(`#message-content-${id}`);
                            const message_timestamp = document.querySelector(`#message-timestamp-${id}`);
                            const message_author_class = document.querySelector(`#message-username-${id}`);
                            if (MsgAuthor.toLowerCase() != "default" && MsgAuthor) {
                                try {
                                const message_author = message_author_class.querySelectorAll('[class^="username-h_Y3Us"]')[0];
                                message_author.textContent = MsgAuthor;
                                }
                                catch(TypeError){
                                    for (const a of document.querySelectorAll('[class^="username-h_Y3Us desaturateUserColors-1O-G89 clickable-31pE3P"]')) {if (a.textContent.includes(username)) {
                                        a.textContent = MsgAuthor;}
                                    }}
                            }
                            if (AvatarUrl.toLowerCase() != "default" && AvatarUrl) {
                                try {
                                    var av = document.querySelector(`#chat-messages-${id} > div > div.contents-2MsGLg`)
                                    var clone = av.querySelector("img").cloneNode(true)
                                    clone.src = AvatarUrl;
                                    av.querySelector("img").remove()
                                    av.insertBefore(clone, av.firstChild)
                                }
                                catch (TypeError) {
                                    try {
                                        const avatar = document.querySelectorAll(`[src^="${image}"]`)[0].src=AvatarUrl;
                                    }
                                    catch(TypeError){
                                        const avatar = message.querySelectorAll(`[src^="/assets/"]`)[0].src=AvatarUrl;
                                    }
                                }
                            }
                            if (MsgContent.toLowerCase() != "default" && MsgContent) {messsage_content.textContent = MsgContent;}
                            if (MsgTimestamp.toLowerCase() != "default" && MsgTimestamp.toLowerCase() != "now" && MsgTimestamp) {
                                try {message_timestamp.textContent = MsgTimestamp;}
                                catch(TypeError){BdApi.showToast("timestamp is defined above")}}
                            else if (MsgTimestamp.toLowerCase() == "now") {
                                const time = "Today at " + new Date().toLocaleString("en-EN", {hour: 'numeric',minute: '2-digit',hour12: true});
                                try {message_timestamp.textContent = time;}
                                catch(TypeError){BdApi.showToast("timestamp is defined above")}
                            }
                            })
                     }}),
                     ContextMenu.buildItem({label: "Delete Message", action: () => {document.getElementById(`chat-messages-${id}`).remove();}}),
                     ContextMenu.buildItem({type: "separator"})
                 );
            });
        }

        onStop() {
            this.unpatch()
            Logger.log("Stopped");
        }

    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/