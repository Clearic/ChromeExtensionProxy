import "spectre.css";
import "./style.css";
import "focus-visible";
import * as Redux from "redux";
import * as ReduxThunk from "redux-thunk";
import { h, Component, render } from "preact";
import * as reducers from "./reducers";
import { Tab, Tabs } from "./components";

const rootReducer = Redux.combineReducers({
    activeTab: reducers.activeTabReducer,
    main: reducers.mainReducer,
    settings: reducers.settingsReducer
});

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
        render(h(App, { store }), document.getElementById("app"));
    });
});
