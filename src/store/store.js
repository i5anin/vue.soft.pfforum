import Vuex from 'vuex'
import EditorToolStore from '@/modules/editor/store'
// import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue/store'
import AuthStore from './authStore'

const store = new Vuex.Store({
  modules: { IssueToolStore, EditorToolStore, AuthStore },
})

// StorageToolStore

export default store
