import {
  addGroup,
  addMaterial,
  addTool,
  addType,
  getLibraries,
  getToolParams,
  getTools,
  getUniqueToolSpecs,
  updateTool,
} from '@/api'
import { foundSomeIdItemInArrayByName } from '@/modules/tool/utils'

export const store = {
  namespaced: true,
  state: {
    isLoading: false,
    paramsList: [],
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
      types: [],
      groups: [],
      materials: [],
      selectedParams: [],
      includeNull: false,
    },

    // filter options
    typeOptions: [],
    groupOptions: [],
    materialOptions: [],
    paramsOptions: [],
  },
  mutations: {
    setParamsList(state, params) {
      state.paramsList = params
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
    setFilters(state, filters) {
      state.filters = { ...filters }
    },
    setIncludeNull(state, includeNull) {
      console.log(state, includeNull)
      state.filters.includeNull = includeNull
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
    setTypeOptions(state, typeOptions) {
      state.typeOptions = typeOptions
    },
    setGroupOptions(state, groupOptions) {
      state.groupOptions = groupOptions
    },
    setParamsOptions(state, paramsOptions) {
      state.paramsOptions = paramsOptions
    },
    setMaterialOptions(state, materialOptions) {
      state.materialOptions = materialOptions
    },
  },
  actions: {
    async fetchParamsList({ commit }) {
      try {
        const paramsData = await getToolParams() // замените на ваш API-запрос
        commit('setParamsList', paramsData)
      } catch (error) {
        console.error('Ошибка при загрузке параметров:', error)
      }
    },
    async initFilterOptions({ commit }) {
      const [{ types, groups, materials }, paramsData] = await Promise.all([
        getLibraries(),
        getToolParams(),
      ])

      commit(
        'setTypeOptions',
        types.map(({ name }) => name)
      )
      commit(
        'setGroupOptions',
        groups.map(({ name }) => name)
      )
      commit(
        'setMaterialOptions',
        materials.map(({ name }) => name)
      )
      commit(
        'setParamsOptions',
        paramsData.map(({ info }) => info)
      )
    },
    async fetchToolsByFilter({ commit, state }, payload) {
      commit('setIsLoading', true)
      const {
        currentPage,
        itemsPerPage,
        search,
        includeNull,
        selectedParams,
        materials,
        groups,
        types,
      } = state.filters
      const parentId = payload?.parentId || null
      try {
        const { tools, totalCount } = await getTools(
          search,
          currentPage,
          itemsPerPage,
          includeNull,
          parentId,
          selectedParams,
          materials,
          groups,
          types
        )
        commit('setTools', tools)
        commit('setToolsTotalCount', totalCount)
      } catch (error) {
        console.error('Ошибка при получении данных:', error)
      } finally {
        commit('setIsLoading', false)
      }
    },
    // async fetchUniqueToolSpecs({ commit }) {
    //   const { shags, gabarits, widths, names } = await getUniqueToolSpecs()
    //   commit('setShagOptions', shags)
    //   commit('setGabaritOptions', gabarits)
    //   commit('setWidthOptions', widths)
    //   commit('setNameOptions', names)
    // },
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
    filters: (state) => ({ ...state.filters }),
    tools: (state) => [...state.tools],
    isLoading: (state) => state.isLoading,

    // filter options
    typeOptions: (state) => state.typeOptions,
    groupOptions: (state) => state.groupOptions,
    materialOptions: (state) => state.materialOptions,
    paramsOptions: (state) => state.paramsOptions,

    // gabaritOptions: (state) => state.gabaritOptions,
    // widthOptions: (state) => state.widthOptions,
    // shagOptions: (state) => state.shagOptions,
    nameOptions: (state) => state.nameOptions,
    toolsTotalCount: (state) => state.toolsTotalCount,
  },
}
