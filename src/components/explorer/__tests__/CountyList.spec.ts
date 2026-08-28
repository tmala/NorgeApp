import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CountyList from '../CountyList.vue'
import { useGeoDataStore } from '../../../stores/geoData'

describe('CountyList.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders list of counties from store', () => {
    const store = useGeoDataStore()
    store.resetToDemo()

    const wrapper = mount(CountyList)

    const buttons = wrapper.findAll('.nav-item')
    expect(buttons.length).toBe(store.fylker.length)
    expect(wrapper.text()).toContain('Oslo')
    expect(wrapper.text()).toContain('Vestland')
  })

  it('selects county when clicking an item', async () => {
    const store = useGeoDataStore()
    store.resetToDemo()

    const wrapper = mount(CountyList)
    const osloButton = wrapper.findAll('.nav-item').find(btn => btn.text().includes('Oslo'))

    expect(osloButton).toBeDefined()
    await osloButton?.trigger('click')

    expect(store.selectedFylkeId).toBe('03')
  })

  it('highlights the selected county button', async () => {
    const store = useGeoDataStore()
    store.resetToDemo()
    store.selectedFylkeId = '03'

    const wrapper = mount(CountyList)
    const activeItem = wrapper.find('.nav-item.active')

    expect(activeItem.exists()).toBe(true)
    expect(activeItem.text()).toContain('Oslo')
  })
})
