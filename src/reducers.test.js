import { rootReducer, createInitState } from "./reducers";
import * as actions from "./actions";

const initState1 = createInitState(false, null);
const initState2 = createInitState(false, { address: "127.0.0.1", port: "1234" });

describe("createInitState", () => {
    it("isProxyOn", () => {
        const s1 = createInitState(false, null);
        const s2 = createInitState(true, null);
    
        expect(s1.main.isProxyOn).toBe(false);
        expect(s2.main.isProxyOn).toBe(true);
    });
    
    it("savedSettings", () => {
        const s1 = createInitState(false, null);
        const s2 = createInitState(true, { address: "127.0.0.1", port: "1234" });
    
        expect(s1.settings.saved).toBeUndefined();
        expect(s2.settings.saved.address).toBe("127.0.0.1");
        expect(s2.settings.saved.port).toBe("1234");
        expect(s2.settings.address).toBe("127.0.0.1");
        expect(s2.settings.port).toBe("1234");
    });
    
    it("activeTab should be settings if setting is null or main otherwise", () => {
        const s1 = createInitState(false, null);
        const s2 = createInitState(false, { address: "127.0.0.1", port: "1234" });
    
        expect(s1.activeTab).toBe("settings");
        expect(s2.activeTab).toBe("main");
    });
});

describe("rootReducer", () => {
    it("should not crush on init", () => {
        const testAction = { type: "TEST" };
        rootReducer(initState1, testAction);
        rootReducer(initState2, testAction);
    });
    
    it("goToMain", () => {
        const state = rootReducer(initState1, actions.goToMain());
        expect(state.activeTab).toEqual("main");
    });
    
    it("goToSettings", () => {
        const state = rootReducer(initState2, actions.goToSettings());
        expect(state.activeTab).toEqual("settings");
    });
    
    it("proxyStatusChanged", () => {
        let state = rootReducer(initState2, actions.proxyStatusChanged(true));
        expect(state.main.isProxyOn).toBe(true);
        state = rootReducer(state, actions.proxyStatusChanged(false));
        expect(state.main.isProxyOn).toBe(false);
    });
    
    it("settingsAddressChanged", () => {
        let state = rootReducer(initState1, actions.settingsAddressChanged("asdf"));
        expect(state.settings.address).toBe("asdf");
        expect(state.settings.addressValMsg).toBeDefined();
        state = rootReducer(state, actions.settingsAddressChanged("192.168.0.1"));
        expect(state.settings.addressValMsg).toBeUndefined();
    });
    
    it("settingsPortChanged", () => {
        let state = rootReducer(initState1, actions.settingsPortChanged("fdsa"));
        expect(state.settings.port).toBe("fdsa");
        expect(state.settings.portValMsg).toBeDefined();
        state = rootReducer(state, actions.settingsPortChanged("8080"));
        expect(state.settings.portValMsg).toBeUndefined();
    });
    
    it("settingsChanged", () => {
        let state = rootReducer(initState1, actions.settingsAddressChanged("192.168.0.1"));
        state = rootReducer(state, actions.settingsPortChanged("8080"));
        state = rootReducer(state, actions.settingsSaved());
        expect(state.settings.address).toBe(state.settings.saved.address);
        expect(state.settings.port).toBe(state.settings.saved.port);
        expect(state.activeTab).toBe("main");
    });
    
    it("settingsChanged2", () => {
        let state = rootReducer(initState2, actions.settingsAddressChanged("192.168.0.1"));
        state = rootReducer(state, actions.settingsPortChanged("8080"));
        state = rootReducer(state, actions.settingsSaved());
        expect(state.settings.address).toBe(state.settings.saved.address);
        expect(state.settings.port).toBe(state.settings.saved.port);
        expect(state.activeTab).toBe("main");
    });
});
