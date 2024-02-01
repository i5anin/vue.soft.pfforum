// store/modules/authStore.js

const authStore = {
  namespaced: true, // Используйте пространство имен для этого модуля
  state: {
    isAuthorized: false,
    userRole: null,
  },
  mutations: {
    SET_AUTHORIZATION(state, isAuthorized) {
      state.isAuthorized = isAuthorized
    },
    SET_USER_ROLE(state, role) {
      state.userRole = role
    },
  },
  actions: {
    setAuthorization({ commit }, isAuthorized) {
      commit('SET_AUTHORIZATION', isAuthorized)
    },
    setUserRole({ commit }, role) {
      commit('SET_USER_ROLE', role)
    },
  },
}

export default authStore
