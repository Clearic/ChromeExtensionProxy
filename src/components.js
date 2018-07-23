import { h, Component } from "preact";
import * as actions from "./actions";
import * as thunks from "./thunks";

export const MainTab = ({ state, dispatch }) => {
    const proxyChange = (e) => {
        if (state.isProxyOn)
            dispatch(thunks.turnProxyOff());
        else
            dispatch(thunks.turnProxyOn());
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

export const SettingsTab = ({ state, dispatch }) => {
    const onAddressChange = e => {
        dispatch(actions.settingsAddressChanged(e.target.value));
    }
    const onPortChanged = e => {
        dispatch(actions.settingsPortChanged(e.target.value));
    }
    const onSaveSettings = () => {
        dispatch(thunks.saveSettings());
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

export const Tabs = ({ activeTab, dispatch }) => {
    const mainClick = (e) => {
        e.preventDefault();
        dispatch(actions.goToMain(false));
    }
    const settingsClick = (e) => {
        e.preventDefault();
        dispatch(actions.goToSettings(true));
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

export const Tab = ({ state, dispatch }) => {
    switch (state.activeTab) {
        case "main":
            return h(MainTab, { state: state.main, dispatch });
        case "settings":
            return h(SettingsTab, { state: state.settings, dispatch });
        default:
            return h("div");
    }
}
