import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import EditToolModal from '@/modules/tool/components/modal/EditToolModal.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('EditToolModal', () => {
  let store
  let vuetify

  beforeEach(() => {
    store = new Vuex.Store({})
    vuetify = new Vuetify()
  })

  it('renders correctly', () => {
    const wrapper = shallowMount(EditToolModal, {
      localVue,
      store,
      vuetify,
      propsData: {
        toolId: null,
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders title for new tool', () => {
    const wrapper = shallowMount(EditToolModal, {
      localVue,
      store,
      vuetify,
      propsData: {
        toolId: null,
      },
    })
    expect(wrapper.text()).toContain('Добавить инструмент')
  })

  it('renders title for editing tool', () => {
    const wrapper = shallowMount(EditToolModal, {
      localVue,
      store,
      vuetify,
      propsData: {
        toolId: 1,
      },
    })
    expect(wrapper.text()).toContain('Редактировать инструмент ID: 1')
  })
})
