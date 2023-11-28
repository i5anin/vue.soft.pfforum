export default {
  namespaced: true,
  state: {
    shagOptions: [],
    gabaritOptions: [],
    widthOptions: [],
  },
  getters: {
    shagOptions: (state) => state.shagOptions,
    gabaritOptions: (state) => state.gabaritOptions,
    widthOptions: (state) => state.widthOptions,
  },
  mutations: {
    setShagOptions(state, options) {
      state.shagOptions = options
    },
    setGabaritOptions(state, options) {
      state.gabaritOptions = options
    },
    setWidthOptions(state, options) {
      state.widthOptions = options
    },
  },
  actions: {
    async fetchShagOptions({ commit }) {
      const uniqueSpecs = await getUniqueToolSpecs() // Предполагается, что getUniqueToolSpecs() - это ваша функция API
      commit('setShagOptions', uniqueSpecs.shags)
    },
    async fetchGabaritOptions({ commit }) {
      const gabaritData = await getGabaritOptions() // Предполагается, что getGabaritOptions() - это ваша функция API
      commit('setGabaritOptions', gabaritData)
    },
    async fetchWidthOptions({ commit }) {
      const widthData = await getWidthOptions() // Предполагается, что getWidthOptions() - это ваша функция API
      commit('setWidthOptions', widthData)
    },
  },
}
