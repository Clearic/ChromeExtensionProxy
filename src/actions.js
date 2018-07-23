import * as types from "./actionTypes"

export const goToMain = () => ({
    type: types.GO_TO_MAIN
});

export const goToSettings = () => ({
    type: types.GO_TO_SETTINGS
});

export const proxyStatusChanged = (isProxyOn) => ({
    type: types.PROXY_STATUS_CHANGED,
    isProxyOn
});

export const settingsAddressChanged = (address) => ({
    type: types.SETTINGS_ADDRESS_CHANGED,
    address
});

export const settingsPortChanged = (port) => ({
    type: types.SETTINGS_PORT_CHANGED,
    port
});

export const settingsSaved = () => ({
    type: types.SETTINGS_SAVED
});