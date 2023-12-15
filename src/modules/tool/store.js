import { addTool, getToolParams, getTools } from '@/api'
// import { foundSomeIdItemInArrayByName } from '@/modules/tool/utils'

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
        // getLibraries(),
        getToolParams(),
      ])

      // commit(
      //   'setTypeOptions',
      //   types.map(({ name }) => name)
      // )
      // commit(
      //   'setGroupOptions',
      //   groups.map(({ name }) => name)
      // )
      // commit(
      //   'setMaterialOptions',
      //   materials.map(({ name }) => name)
      // )
      // commit(
      //   'setParamsOptions',
      //   paramsData.map(({ info }) => info)
      // )
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
    async onSaveToolModel({ dispatch }, toolModel) {
      try {
        const paramsData = await getToolParams()
        const paramsMap = new Map(
          paramsData.map((param) => [param.info, param.id.toString()])
        )

        // Собираем свойства инструмента
        const properties = {}
        Object.entries(toolModel.properties).forEach(([key, value]) => {
          const paramId = paramsMap.get(key)
          if (paramId && value !== undefined && value !== '') {
            properties[paramId] = value
          }
        })

        const toolData = {
          name: toolModel.name,
          property: properties,
        }

        // Отправка данных на сервер
        const result = await addTool(toolData)
        if (result) {
          dispatch('fetchToolsByFilter')
          localStorage.setItem('lastSavedToolModel', JSON.stringify(toolModel))
        }
      } catch (error) {
        console.error('Ошибка при сохранении инструмента:', error)
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
