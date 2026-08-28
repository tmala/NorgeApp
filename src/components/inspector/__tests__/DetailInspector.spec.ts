import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DetailInspector from '../DetailInspector.vue'
import { useGeoDataStore } from '../../../stores/geoData'

describe('DetailInspector.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders empty state when nothing is selected', () => {
    const store = useGeoDataStore()
    store.resetToDemo()

    const wrapper = mount(DetailInspector)
    expect(wrapper.text()).toContain('Ingen detaljer valgt')
  })

  it('renders fylke details when a county is selected', async () => {
    const store = useGeoDataStore()
    store.resetToDemo()
    store.selectFylke('03') // Oslo

    const wrapper = mount(DetailInspector)
    expect(wrapper.text()).toContain('Fylke detalj')
    expect(wrapper.text()).toContain('Oslo')
    expect(wrapper.text()).toContain('Fylkesnummer')
  })

  it('renders kommune details and postal code links when a municipality is selected', async () => {
    const store = useGeoDataStore()
    store.resetToDemo()
    store.selectKommune('0301') // Oslo kommune

    const wrapper = mount(DetailInspector)
    expect(wrapper.text()).toContain('Kommune detalj')
    expect(wrapper.text()).toContain('0301')
    expect(wrapper.text()).toContain('Vis i Google Maps')
  })

  it('renders postnummer details when a postal code is selected', async () => {
    const store = useGeoDataStore()
    store.resetToDemo()
    store.selectPostnummer('0001')

    const wrapper = mount(DetailInspector)
    expect(wrapper.text()).toContain('Postnummer detalj')
    expect(wrapper.text()).toContain('0001')
    expect(wrapper.text()).toContain('Åpne i Google Maps')
  })
})
