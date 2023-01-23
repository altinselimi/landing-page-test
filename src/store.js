import { createStore } from "vuex";
import phoneResponse from "./phones-response.json";

const storeInstance = createStore({
	state: {
		phones: [],
	},
	actions: {
		fetchPhones({ commit }) {
			return new Promise((resolve) => {
				setTimeout(() => resolve(phoneResponse), 350);
			}).then((res) => commit("SET_PHONES", res.products));
		},
	},
	mutations: {
		SET_PHONES(state, data) {
			state.phones = data;
		},
	},
});

export default storeInstance;
