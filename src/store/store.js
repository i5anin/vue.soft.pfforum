import Vuex from 'vuex'
import EditorToolStore from '@/modules/editor/store'
import IssueToolStore from '@/modules/issue/store'
import ViewToolStore from '@/modules/view/store'
import AuthStore from './authStore'

const store = new Vuex.Store({
  modules: { IssueToolStore, EditorToolStore, AuthStore, ViewToolStore },
})

// StorageToolStore

export default store
