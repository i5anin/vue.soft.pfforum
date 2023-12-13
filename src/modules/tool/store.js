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
    async onSaveToolModel({ dispatch }, toolModel) {
      try {
        console.log('Исходная модель инструмента:', toolModel) // Отладка: исходные данные модели

        // Получаем список допустимых ключей параметров
        const paramsData = await getToolParams()
        console.log('Полученные параметры инструмента:', paramsData) // Отладка: параметры инструмента

        const paramsMap = new Map(
          paramsData.map((param) => [param.info, param.id.toString()])
        )
        console.log('Карта соответствия параметров:', paramsMap) // Отладка: карта соответствия

        // Собираем свойства инструмента
        const properties = {}
        for (const [key, value] of Object.entries(toolModel)) {
          console.log(`Проверка ключа ${key} со значением ${value}`) // Отладка: текущий ключ и значение

          const paramId = paramsMap.get(key)
          console.log(`Найденный идентификатор параметра для ${key}:`, paramId) // Отладка: идентификатор параметра

          if (paramId && value !== undefined && value !== '') {
            properties[paramId] = value
            console.log(`Добавлено свойство ${paramId}:`, value) // Отладка: добавленное свойство
          }
        }

        console.log('Сформированные свойства для отправки:', properties) // Отладка: свойства для отправки

        // Формирование данных для отправки
        const toolData = {
          name: toolModel.name,
          property: properties,
        }
        console.log('Данные для отправки:', toolData) // Отладка: данные для отправки

        // Отправка данных на сервер
        const result = await addTool(toolData) // Вызов API для добавления инструмента
        console.log('Результат добавления инструмента:', result) // Отладка: результат добавления

        if (result) {
          dispatch('fetchToolsByFilter') // Обновляем список инструментов
          localStorage.setItem('lastSavedToolModel', JSON.stringify(toolModel)) // Сохраняем модель в localStorage
          console.log('Инструмент сохранен')
        }
      } catch (error) {
        console.error('Ошибка при сохранении инструмента:', error)
        console.log('Ошибка:', error) // Отладка: ошибка
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
