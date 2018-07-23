import * as actions from "./actions";

const scope = chrome.extension.inIncognitoContext ? "incognito_persistent" : "regular";

export const turnProxyOn = () => {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.settings.saved.address || !state.settings.saved.port){
            dispatch(actions.goToSettings());
            return;
        }
        const config = {
            mode: "fixed_servers",
            rules: {
                proxyForHttp: {
                    scheme: "socks5",
                    host: state.settings.saved.address,
                    port: parseInt(state.settings.saved.port)
                },
                bypassList: []
            }
        };
    
        chrome.proxy.settings.set({ value: config, scope },() => {
            dispatch(actions.proxyStatusChanged(true));
        });
    }
}

export const turnProxyOff = () => {
    return (dispatch, getState) => {
        chrome.proxy.settings.clear({ scope }, () => {
            dispatch(actions.proxyStatusChanged(false));
        });
    }
}

export const saveSettings = () => {
    return (dispatch, getState) => {
        const state = getState();
        const val = { address: state.settings.address, port: state.settings.port };
        chrome.storage.local.set({proxy: val}, () => {
            dispatch(actions.settingsSaved());
        });
    }
}
