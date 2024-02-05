import { toolEditorApi } from '@/modules/editor-tool/api/editor'
import { toolApi } from '@/api'

export default {
  namespaced: true,
  state: () => ({
    idParent: { id: 1, label: null },
    isLoading: false,
    paramsList: [],
    nameOptions: [],
    additionalFilters: {},
    tool: null,
    tools: [],
    toolsTotalCount: 0,
    filters: {
      currentPage: 1,
      itemsPerPage: 15,
      search: '',
      selectedParams: [],
      includeNull: false,
    },
  }),
  mutations: {
    updateIdParent(state, idParentData) {
      state.idParent = { ...idParentData }
    },
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
    setAdditionalFilters(state, additionalFilters) {
      state.additionalFilters = additionalFilters
    },
  },
  actions: {
    async fetchToolById({ commit }, id) {
      try {
        const tool = await toolApi.getToolById(id)
        commit('setTool', tool)
      } catch (error) {
        console.error('Ошибка при загрузке инструмента:', error)
      }
    },
    async fetchAdditionalFilters(/* { commit, state } */) {
      // const { id: parentId } = state.idParent
      // const paramsList = await toolApi.getAdditionalFilters(parentId)
      // const additionalFilters = paramsList.reduce(
      //   (acc, curr) =>
      //     curr.selectedValue
      //       ? {
      //           ...acc,
      //           [`param_${curr.key}`]: {
      //             value: null,
      //             label: curr.label,
      //             options: curr.values,
      //           },
      //         }
      //       : acc,
      //   {}
      // ) // { param_1: { value: null, options: ['Сверло ', 'Резец', 'Пластина', 'Метчик '] } }
      //
      // commit('setAdditionalFilters', additionalFilters)
    },
    async fetchToolsByFilter({ commit, state }) {
      // console.log('РЕДАКТОР VUEX')
      commit('setIsLoading', true)
      const { currentPage, itemsPerPage, search, includeNull, selectedParams } =
        state.filters
      const { id: parentId } = state.idParent
      try {
        const { tools, totalCount, paramsList } = await toolApi.getTools(
          search,
          currentPage,
          itemsPerPage,
          includeNull,
          parentId,
          selectedParams,
          Object.entries(state.additionalFilters).reduce(
            (acc, [key, { value }]) => (value ? { ...acc, [key]: value } : acc),
            {}
          )
        )
        commit('setParamsList', paramsList)
        commit('setTools', tools) // Инструменты
        commit('setToolsTotalCount', totalCount) // Счетчик
      } catch (error) {
        console.error('getTools. Ошибка при получении данных:', error)
      } finally {
        commit('setIsLoading', false)
      }
    },
    async onSaveToolModel({ dispatch }, toolModel) {
      try {
        // Отправка данных на сервер
        const result = await toolEditorApi.addTool({
          name: toolModel.name,
          property: Object.fromEntries(
            Object.entries(toolModel.property).filter(
              ([, value]) => value != null
            ) // {name: 'her',} -> ['name', 'her'] - преобразование данных
          ),
        })
        if (result) dispatch('fetchToolsByFilter')
      } catch (error) {
        console.error('Ошибка при сохранении инструмента:', error)
      }
    },
  },
  getters: {
    idParent: (state) => state.idParent,
    filters: (state) => ({ ...state.filters }),
    tool: (state) => {
      if (state.tool) {
        return {
          ...state.tool,
          property: state.tool.property,
          parent_id: state.tool.parent_id,
          folder_name: state.tool.folder_name,
        }
      }
      return null
    },
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
    paramsOptions: (state) => state.paramsOptions,
    paramsList: (state) => state.paramsList,
    nameOptions: (state) => state.nameOptions,
    toolsTotalCount: (state) => state.toolsTotalCount,
  },
}
