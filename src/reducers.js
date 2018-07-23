import * as types from "./actionTypes";

export const activeTabReducer = (state = "", action) => {
    switch (action.type) {
        case types.GO_TO_MAIN:
        case types.SETTINGS_SAVED:
            return "main";
        case types.GO_TO_SETTINGS:
            return "settings";
        default:
            return state;
    }
}

export const mainReducer = (state = { isProxyOn: false }, action) => {
    switch (action.type) {
        case types.PROXY_STATUS_CHANGED:
            return Object.assign({}, state, { isProxyOn: action.isProxyOn });
        default:
            return state;
    }
}

function validatePort(port) {
    if (!/^\d+$/.test(port)) 
        return false;
    const n = parseInt(port);
    return 0 < n && n < 65535;
}

function validateIpAddress(address) {
    const re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return re.test(address);
}

export const settingsReducer = (state = { isProxyOn: false }, action) => {
    switch (action.type) {
        case types.SETTINGS_ADDRESS_CHANGED: {
            const addressValMsg = validateIpAddress(action.address) ? null : "Invalid IP Address";
            return Object.assign({}, state, { address: action.address, addressValMsg });
        }
        case types.SETTINGS_PORT_CHANGED: {
            const portValMsg = validatePort(action.port) ? null : "Invalid Port";
            return Object.assign({}, state, { port: action.port, portValMsg });
        }
        case types.SETTINGS_SAVED:
            return Object.assign({}, state, { saved: { address: state.address, port: state.port } });
        default:
            return state;
    }
}
