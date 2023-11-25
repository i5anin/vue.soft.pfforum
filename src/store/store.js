// src/store.js или src/store/index.js
import { createStore } from 'vuex'

export default {
  state: {
    shagOptions: [],
    gabaritOptions: [],
    widthOptions: [],
    // другие данные
  },
  getters: {
    shagOptions: (state) => state.shagOptions,
    // другие геттеры
  },
  mutations: {
    setShagOptions(state, options) {
      state.shagOptions = options
    },
    // другие мутации
  },
  actions: {
    async fetchShagOptions({ commit }) {
      const uniqueSpecs = await getUniqueToolSpecs() // Предполагается, что getUniqueToolSpecs - это функция API
      commit('setShagOptions', uniqueSpecs.shags)
    },
    // другие действия
  },
}
