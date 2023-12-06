import {
  addGroup,
  addMaterial,
  addTool,
  addType,
  getLibraries,
  getTools,
  getUniqueToolSpecs,
  updateTool,
} from '@/api'
import { foundSomeIdItemInArrayByName } from '@/modules/tool/utils'

export const store = {
  namespaced: true,
  state: {
    isLoading: false,

    shagOptions: [],
    gabaritOptions: [],
    widthOptions: [],
    nameOptions: [],

    tools: [],
    toolsTotalCount: 0,
    filters: {
      currentPage: 1,
      itemsPerPage: 15,
      search: '',
    },
  },
  mutations: {
    setIncludeNull(state, includeNull) {
      state.filters.includeNull = includeNull
    },
    setIsLoading(state, isLoading) {
      state.isLoading = isLoading
    },
    setShagOptions(state, options) {
      state.shagOptions = options
    },
    setGabaritOptions(state, options) {
      state.gabaritOptions = options
    },
    setWidthOptions(state, options) {
      state.widthOptions = options
    },
    setNameOptions(state, options) {
      state.nameOptions = options
    },
    setCurrentPage(state, page) {
      state.filters.currentPage = page
    },
    setSearch(state, search) {
      state.filters.search = search
    },
    setItemsPerPage(state, itemsPerPage) {
      state.filters.itemsPerPage = itemsPerPage
    },
    setToolsTotalCount(state, toolTotalCount) {
      state.toolsTotalCount = toolTotalCount
    },
    setTools(state, tools) {
      state.tools = tools
    },
  },
  actions: {
    async fetchToolsByFilter({ commit, getters }) {
      commit('setIsLoading', true)
      const { itemsPerPage, search, currentPage, includeNull } = getters.filters // Include includeNull here
      const { tools, totalCount } = await getTools(
        search,
        currentPage,
        itemsPerPage,
        includeNull
      )
      commit('setTools', tools)
      commit('setToolsTotalCount', totalCount)
      commit('setIsLoading', false)
    },

    async fetchUniqueToolSpecs({ commit }) {
      const { shags, gabarits, widths, names } = await getUniqueToolSpecs()
      commit('setShagOptions', shags)
      commit('setGabaritOptions', gabarits)
      commit('setWidthOptions', widths)
      commit('setNameOptions', names)
    },
    async onSaveToolModel({ dispatch }, toolModel) {
      const { id, group, type, mat, name } = toolModel
      const { groups, materials, types } = await getLibraries()

      let groupId = foundSomeIdItemInArrayByName(group, groups)
      let matId = foundSomeIdItemInArrayByName(mat, materials)
      let typeId = foundSomeIdItemInArrayByName(type, types)

      if (groupId == null) {
        const newGroup = await addGroup(group)
        groupId = newGroup.id
      }

      if (matId == null) {
        const newMaterial = await addMaterial(mat)
        matId = newMaterial.id
      }

      if (typeId == null) {
        const newType = await addType(type)
        typeId = newType.id
      }

      const toolData = {
        ...toolModel,
        group_id: parseInt(groupId),
        mat_id: parseInt(matId),
        type_id: parseInt(typeId),
      }
      let result
      if (id == null) {
        result = await addTool(toolData)
      } else {
        result = await updateTool(id, toolData)
      }

      if (result) {
        this.dispatch('tool/fetchToolsByFilter')
        localStorage.setItem('lastSavedToolModel', JSON.stringify(toolModel))
        console.log('Инструмент сохранен в localStorage')
      }
    },
  },
  getters: {
    filters: (state) => state.filters,
    tools: (state) => state.tools,
    toolsTotalCount: (state) => state.toolsTotalCount,
    isLoading: (state) => state.isLoading,
    shagOptions: (state) => state.shagOptions,
    gabaritOptions: (state) => state.gabaritOptions,
    widthOptions: (state) => state.widthOptions,
    nameOptions: (state) => state.nameOptions,
  },
}
