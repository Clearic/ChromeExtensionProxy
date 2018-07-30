'use strict';
import "spectre.css";
import "./style.css";
import "focus-visible";
import * as Redux from "redux";
import * as ReduxThunk from "redux-thunk";
import { h, Component, render } from "preact";
import * as reducers from "./reducers";
import { Tab, Tabs } from "./components";

class App extends Component {
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
    chrome.storage.local.get("proxy", result => {
        const initState = reducers.createInitState(details.value.rules !== undefined, result.proxy);
        const store = Redux.createStore(reducers.rootReducer, initState, Redux.applyMiddleware(ReduxThunk.default));
        render(h(App, { store }), document.getElementById("app"));
    });
});
