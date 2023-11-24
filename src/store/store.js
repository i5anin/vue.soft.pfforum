// src/store.js или src/store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    tools: [],
    totalTools: 0,
    currentPage: 1,
    itemsPerPage: 15,
    loading: false,
    searchQuery: '',
    // Другие переменные состояния
  },
  mutations: {
    // Мутации для обновления состояния
  },
  actions: {
    async getToolsTab({ commit, state }) {
      // Логика запроса к API и коммит изменений в state
    },
    // Другие actions
  },
  getters: {
    // Геттеры для доступа к состоянию
  },
})
