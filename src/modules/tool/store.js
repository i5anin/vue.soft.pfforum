import { addTool, getTools, getToolById } from '@/api'

export const store = {
  namespaced: true,
  state: {
    isLoading: false,
    paramsList: [],
    shagOptions: [],
    gabaritOptions: [],
    widthOptions: [],
    nameOptions: [],

    tool: null,
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
    setCurrentPage(state, page) {
      state.filters.currentPage = page
    },
    setFilters(state, filters) {
      state.filters = { ...filters }
    },
    setTool(state, tool) {
      state.tool = tool
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
    setNameOptions(state, options) {
      state.nameOptions = options
    },
    setSearch(state, search) {
      state.filters.search = search
    },
    setIncludeNull(state, includeNull) {
      state.filters.includeNull = includeNull
    },
  },
  actions: {
    async fetchToolById({ commit }, id) {
      try {
        const tool = await getToolById(id)
        commit('setTool', tool)
      } catch (error) {
        console.error('Ошибка при загрузке инструмента:', error)
      }
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
        const { tools, totalCount, paramsList } = await getTools(
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
        commit('setParamsList', paramsList)
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
        // Отправка данных на сервер
        const result = await addTool({
          name: toolModel.name,
          property: Object.fromEntries(
            Object.entries(toolModel.property).filter(
              ([, value]) => value != null
            ) // {name: 'her',} -> ['name', 'her'] - преобразование данных
          ),
        })
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
    tool: (state) => ({ ...state.tool, property: state.tool.property }),
    tools: (state) => [...state.tools],
    formattedTools: (state) =>
      state.tools.map((tool) => ({
        ...tool,
        ...Object.entries(tool.property).reduce(
          (acc, [key, { value }]) => ({
            ...acc,
            [key]: value,
          }),
          {}
        ),
      })),
    isLoading: (state) => state.isLoading,

    // параметры фильтра
    typeOptions: (state) => state.typeOptions,
    groupOptions: (state) => state.groupOptions,
    materialOptions: (state) => state.materialOptions,
    paramsOptions: (state) => state.paramsOptions,
    paramsList: (state) => state.paramsList,
    nameOptions: (state) => state.nameOptions,
    toolsTotalCount: (state) => state.toolsTotalCount,
  },
}
