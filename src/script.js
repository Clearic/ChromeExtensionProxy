import "spectre.css";
import "./style.css";
import "focus-visible";
import * as Redux from "redux";
import * as ReduxThunk from "redux-thunk";
import * as preact from "preact";


const scope = chrome.extension.inIncognitoContext ? "incognito_persistent" : "regular";

const GO_TO_MAIN = "GO_TO_MAIN";
const GO_TO_SETTINGS = "GO_TO_SETTINGS";
const PROXY_STATUS_CHANGED = "PROXY_STATUS_CHANGED";
const SETTINGS_ADDRESS_CHANGED = "SETTINGS_ADDRESS_CHANGED";
const SETTINGS_PORT_CHANGED = "SETTINGS_PORT_CHANGED";
const SETTINGS_SAVED = "SETTINGS_SAVED";

const goToMain = () => ({
    type: GO_TO_MAIN
});

const goToSettings = () => ({
    type: GO_TO_SETTINGS
});

const proxyStatusChanged = (isProxyOn) => ({
    type: PROXY_STATUS_CHANGED,
    isProxyOn
});

const settingsAddressChanged = (address) => ({
    type: SETTINGS_ADDRESS_CHANGED,
    address
});

const settingsPortChanged = (port) => ({
    type: SETTINGS_PORT_CHANGED,
    port
});

const settingsSaved = () => ({
    type: SETTINGS_SAVED
});

const turnProxyOn = () => {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.settings.saved.address || !state.settings.saved.port){
            dispatch(goToSettings());
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
            dispatch(proxyStatusChanged(true));
        });
    }
}

const turnProxyOff = () => {
    return (dispatch, getState) => {
        chrome.proxy.settings.clear({ scope }, () => {
            dispatch(proxyStatusChanged(false));
        });
    }
}

const saveSettings = () => {
    return (dispatch, getState) => {
        const state = getState();
        const val = { address: state.settings.address, port: state.settings.port };
        chrome.storage.local.set({proxy: val}, () => {
            dispatch(settingsSaved());
        });
    }
}

const activeTabReducer = (state = "", action) => {
    switch (action.type) {
        case GO_TO_MAIN:
        case SETTINGS_SAVED:
            return "main";
        case GO_TO_SETTINGS:
            return "settings";
        default:
            return state;
    }
}

const mainReducer = (state = { isProxyOn: false }, action) => {
    switch (action.type) {
        case PROXY_STATUS_CHANGED:
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

const settingsReducer = (state = { isProxyOn: false }, action) => {
    switch (action.type) {
        case SETTINGS_ADDRESS_CHANGED: {
            const addressValMsg = validateIpAddress(action.address) ? null : "Invalid IP Address";
            return Object.assign({}, state, { address: action.address, addressValMsg });
        }
        case SETTINGS_PORT_CHANGED: {
            const portValMsg = validatePort(action.port) ? null : "Invalid Port";
            return Object.assign({}, state, { port: action.port, portValMsg });
        }
        case SETTINGS_SAVED:
            return Object.assign({}, state, { saved: { address: state.address, port: state.port } });
        default:
            return state;
    }
}

const rootReducer = Redux.combineReducers({
    activeTab: activeTabReducer,
    main: mainReducer,
    settings: settingsReducer
});

const h = preact.h;

const MainTab = ({ state, dispatch }) => {
    const proxyChange = (e) => {
        if (state.isProxyOn)
            dispatch(turnProxyOff());
        else
            dispatch(turnProxyOn());
    }
    return h("div", { className: "form-group" },
        h("label", { className: "form-switch" },
            h("input", { type: "checkbox", checked: state.isProxyOn, onClick: proxyChange }),
            h("i", { className: "form-icon" }),
            " Proxy is ",
            (state.isProxyOn ? "On" : "Off")
        )
    );
}

const SettingsTab = ({ state, dispatch }) => {
    const onAddressChange = e => {
        dispatch(settingsAddressChanged(e.target.value));
    }
    const onPortChanged = e => {
        dispatch(settingsPortChanged(e.target.value));
    }
    const onSaveSettings = () => {
        dispatch(saveSettings());
    }
    const isSettingsChanged = () => state.saved == undefined || state.address != state.saved.address || state.port != state.saved.port;
    const isFormValid = () => !state.portValMsg && !state.addressValMsg;
    return h("div", { className: "columns" },
        h("div", { className: "column col-8 form-group" + (state.addressValMsg ? " has-error" : "") },
            h("label", { className: "form-label", for: "ipaddress" }, "IP Address"),
            h("input", { className: "form-input", type: "text", id: "ipaddress", placeholder: "IP Address", value: state.address, onInput: onAddressChange }),
            h("p", { className: "form-input-hint" }, state.addressValMsg)
        ),
        h("div", { className: "column col-4 form-group" + (state.portValMsg ? " has-error" : "") },
            h("label", { className: "form-label", for: "port" }, "Port"),
            h("input", { className: "form-input", type: "text", id: "port", placeholder: "Port", value: state.port, onInput: onPortChanged }),
            h("p", { className: "form-input-hint" }, state.portValMsg)
        ),
        h("div", { className: "column col-4" },
            h("button", { className: "btn btn-primary", onClick: onSaveSettings, disabled: !(isSettingsChanged() && isFormValid()) }, "Save")
        )
    );
}

const Tabs = ({ activeTab, dispatch }) => {
    const mainClick = (e) => {
        e.preventDefault();
        dispatch(goToMain(false));
    }
    const settingsClick = (e) => {
        e.preventDefault();
        dispatch(goToSettings(true));
    }
    return h("ul", { className: "tab tab-block" },
        h("li", { className: "tab-item " + (activeTab == "main" ? "active" : "") },
            h("a", { className: (activeTab == "main" ? "active" : ""), onClick: mainClick, href: "#" }, "Main")
        ),
        h("li", { className: "tab-item " + (activeTab == "settings" ? "active" : "") },
            h("a", { className: (activeTab == "settings" ? "active" : ""), onClick: settingsClick, href: "#" }, "Settings")
        ),
    );
}

const Tab = ({ state, dispatch }) => {
    switch (state.activeTab) {
        case "main":
            return h(MainTab, { state: state.main, dispatch });
        case "settings":
            return h(SettingsTab, { state: state.settings, dispatch });
        default:
            return h("div");
    }
}

class App extends preact.Component {
    constructor(props) {
        super(props);
        this.state = this.props.store.getState();
    }
    componentDidMount() {
        this.unsubscribe = this.props.store.subscribe(() => {
            this.setState(this.props.store.getState());
        })
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render(props, state) {
        return h(
            "div",
            null,
            h(Tabs, { activeTab: state.activeTab, dispatch: props.store.dispatch }),
            h(Tab, { state: state, dispatch: props.store.dispatch })
        );
    }
}

chrome.proxy.settings.get({incognito: false}, details => {
    const initState = { main: {}, settings: {} };
    initState.main.isProxyOn = (details.value.rules !== undefined);

    chrome.storage.local.get("proxy", result => {
        const proxy = result.proxy;
        if (proxy) {
            initState.settings.saved = proxy;
            initState.settings.address = proxy.address;
            initState.settings.port = proxy.port;
            initState.activeTab = "main";
        } else {
            initState.activeTab = "settings";
            initState.settings.address = "";
            initState.settings.port = "";
        }
        const store = Redux.createStore(rootReducer, initState, Redux.applyMiddleware(ReduxThunk.default));
        // const unsubscribe = store.subscribe(() => {
        //     console.log(store.getState());
        // });
        preact.render(h(App, { store }), document.getElementById("app"));
    });
});
