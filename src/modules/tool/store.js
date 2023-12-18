import { addTool, getToolParams, getTools, getToolById } from '@/api'
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
      state.filters.includeNull = includeNull
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
    async fetchToolById({ commit }, id) {
      try {
        const tool = await getToolById(id)
        commit('setTool', tool)
      } catch (error) {
        console.error('Ошибка при загрузке инструмента:', error)
      }
    },

    async fetchParamsList({ commit }) {
      try {
        const paramsData = await getToolParams()
        commit('setParamsList', paramsData)
      } catch (error) {
        console.error('Ошибка при загрузке параметров:', error)
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
        // const paramsData = await getToolParams()
        // const paramsMap = new Map(
        //   paramsData.map((param) => [param.info, param.id.toString()])
        // )

        // Собираем свойства инструмента
        // const properties = {}
        // Object.entries(toolModel.properties).forEach(([key, value]) => {
        //   const paramId = paramsMap.get(key)
        //   if (paramId && value !== undefined && value !== '') {
        //     properties[paramId] = value
        //   }
        // })

        // Отправка данных на сервер
        const result = await addTool({
          name: toolModel.name,
          property: Object.fromEntries(
            Object.entries(toolModel.properties).filter(
              ([, value]) => value != null
            ) // {name: 'her',} -> ['name', 'her']
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
    tool: (state) => ({ ...state.tool, properties: state.tool.property }),
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

    // filter options
    typeOptions: (state) => state.typeOptions,
    groupOptions: (state) => state.groupOptions,
    materialOptions: (state) => state.materialOptions,
    paramsOptions: (state) => state.paramsOptions,
    paramsList: (state) => state.paramsList,

    // gabaritOptions: (state) => state.gabaritOptions,
    // widthOptions: (state) => state.widthOptions,
    // shagOptions: (state) => state.shagOptions,
    nameOptions: (state) => state.nameOptions,
    toolsTotalCount: (state) => state.toolsTotalCount,
  },
}
