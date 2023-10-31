// store.js
import { createStore } from 'vuex';
import { fetchTools, addTool } from '@/api/api';

export default createStore({
  state: {
    openDialog: false,
    tools: [],
  },
  mutations: {
    toggleDialog(state) {
      state.openDialog = !state.openDialog;
    },
    setTools(state, tools) {
      state.tools = tools;
    },
    addTool(state, tool) {
      state.tools.push(tool);
    },
  },
  actions: {
    async fetchTools({ commit }) {
      const tools = await fetchTools();
      commit('setTools', tools);
    },
    async addTool({ commit }, newToolName) {
      const addedTool = await addTool(newToolName);
      if (addedTool) {
        commit('addTool', addedTool);
      }
    },
  },
});

