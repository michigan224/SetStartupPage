/**
 * @name Set Startup Page
 * @author David Sanabria
 * @description Allows setting a channel to be chosen when you start
 * @version 1.0.0
 * @donate https://paypal.me/michigan224
 * @source https://github.com/michigan224/SetStartupPage
 */

module.exports = meta => {
    const defaultSettings = { serverName: "", folderName: "", delay: 500 };

    function handleInputChange(ev) {
        const inputName = ev.target.id;
        const value = ev.target.value;
        const mySettings = Object.assign({}, defaultSettings, BdApi.loadData("setStartupPage", "settings"));
        const values = {
            ...mySettings,
            [inputName]: value
        }
        BdApi.saveData("setStartupPage", "settings", values);
    }

    function buildSettings() {
        const mySettings = Object.assign({}, defaultSettings, BdApi.loadData("setStartupPage", "settings"));
        const setting = Object.assign(document.createElement("div"), { className: "setting" });

        // Build Server Name Input
        const serverNameContainer = Object.assign(document.createElement("div"), { className: "inputContainer" });
        const serverNameLabel = Object.assign(document.createElement("label"), { for: "serverName", textContent: "Server Name", className: "inputLabel" });
        const serverNameInputContainer = Object.assign(document.createElement("div"), { className: "bd-search-wrapper innerInputContainer" });
        const serverNameInput = Object.assign(document.createElement("input"), { type: "text", id: "serverName", className: "bd-search", value: mySettings.serverName });
        serverNameInputContainer.append(serverNameInput);
        serverNameContainer.append(serverNameLabel, serverNameInputContainer);

        // Build Folder Name Input
        const container1 = Object.assign(document.createElement("div"), { className: "container" });
        const folderNameContainer = Object.assign(document.createElement("div"), { className: "inputContainer" });
        const folderNameLabel = Object.assign(document.createElement("label"), { for: "folderName", textContent: "Folder Name", className: "inputLabel" });
        const folderDescription = Object.assign(document.createElement("p"), { textContent: "Only set this if your server is in a folder.", className: "delayDescription" });
        const folderNameInputContainer = Object.assign(document.createElement("div"), { className: "bd-search-wrapper innerInputContainer" });
        const folderNameInput = Object.assign(document.createElement("input"), { type: "text", id: "folderName", className: "bd-search", value: mySettings.folderName, placeholder: "Optional" });
        folderNameInputContainer.append(folderNameInput);
        folderNameContainer.append(folderNameLabel, folderNameInputContainer);
        container1.append(folderNameContainer, folderDescription);

        // Build Delay Input
        const container2 = Object.assign(document.createElement("div"), { className: "container" });
        const delayContainer = Object.assign(document.createElement("div"), { className: "inputContainer" });
        const delayLabel = Object.assign(document.createElement("label"), { for: "delay", textContent: "Delay", className: "inputLabel" });
        const delayDescription = Object.assign(document.createElement("p"), { textContent: "Only change this if you use a folder and the plugin opens the folder, but fails to open the server. Increase until the plugin is consistent (this is milliseconds).", className: "delayDescription" });
        const delayInputContainer = Object.assign(document.createElement("div"), { className: "bd-search-wrapper innerInputContainer" });
        const delayInput = Object.assign(document.createElement("input"), { type: "number", id: "delay", className: "bd-search", value: mySettings.delay });
        delayInputContainer.append(delayInput);
        delayContainer.append(delayLabel, delayInputContainer);
        container2.append(delayContainer, delayDescription);

        serverNameInput.addEventListener("input", handleInputChange);
        folderNameInput.addEventListener("input", handleInputChange);
        delayInput.addEventListener("input", handleInputChange);
        setting.append(serverNameContainer, container1, container2);

        BdApi.injectCSS("setStartupPage", `.inputContainer {
            width: 50%;
            height: 75px;
        }
        .delayDescription {
            font-size: 14px;
            color: white;
        }
        .inputLabel {
            color: white;
            font-size: 20px;
        }
        .innerInputContainer {
            margin: 10px 0px;
            margin-right: 10px;
        }
        .container {
            display: flex;
            align-items: center;
        }
        .container > div, p {
            width: 50%;
        }`);

        return setting;
    }

    function delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    return {
        start: async () => {
            const mySettings = Object.assign({}, defaultSettings, BdApi.loadData("setStartupPage", "settings"));
            if (mySettings.serverName === "") return;

            const targetServer = mySettings.serverName;
            const targetFolder = mySettings.folderName;

            const guildsNav = document.querySelector('ul[data-list-id="guildsnav"]');
            const guilds = guildsNav.querySelector('div[aria-label="Servers"]');

            let servers = [];
            servers = guilds.querySelectorAll(':scope > div[class*="listItem-"]');

            if (!!targetFolder) {
                const folders = guilds.querySelectorAll(':scope > div[class*="wrapper-"]');
                const folderToNameMap = [];
                const foundFolder = false;
                for (const folder of folders) {
                    const folderName = folder.querySelector('div[data-dnd-name]').getAttribute('data-dnd-name');
                    const clickableFolder = folder.querySelector('div[class*="closedFolderIconWrapper-"]');
                    if (folderName === targetFolder) {
                        servers = folder.querySelector('ul[id*="folder-items-"]');
                        if (servers === null) {
                            clickableFolder.click();
                            await delay(500);
                            servers = folder.querySelector('ul[id*="folder-items-"]');
                            foundFolder = true;
                        }
                        servers = servers.querySelectorAll(':scope > div[class*="listItem-"]');
                        console.log(folder, servers)
                        break;
                    }
                    folderToNameMap.push({ folder: clickableFolder, folderName });
                }
                if (!foundFolder) {
                    console.error(`Failed to find "${targetFolder}". Here is the folders I found:`, folderToNameMap);
                    return;
                }
            }

            const serverToNameMap = [];
            for (const server of servers) {
                const clickableServer = server.querySelector('div[class*="wrapper-"][role="treeitem"]');
                const serverName = server.querySelector('div[class*="blobContainer-"]').getAttribute('data-dnd-name');
                if (serverName === targetServer) {
                    clickableServer.click();
                    return;
                }
                serverToNameMap.push({ server: clickableServer, serverName });
            }
            console.error("Failed to find server. Here is the servers I found:", serverToNameMap);
        },

        stop: () => {
        },

        getSettingsPanel: () => {
            const mySettingsPanel = document.createElement("div");
            mySettingsPanel.id = "my-settings";

            const settings = buildSettings();

            mySettingsPanel.append(settings);
            return mySettingsPanel;
        }
    }
};