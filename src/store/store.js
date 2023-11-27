import Vuex from 'vuex'
import { store as ToolModelStore } from '@/modules/tool/store'

const store = new Vuex.Store({
  modules: {
    tool: ToolModelStore,
  },
})

export default store
