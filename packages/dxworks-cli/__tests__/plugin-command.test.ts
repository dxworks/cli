import {getAllAvailablePlugins, getPluginInfo} from '../src/commands/plugin/list'
import assert from 'assert'

describe('Test plugin commandr', () => {
    it('should find plugin info when requested', () => {
        const pluginInfo = getPluginInfo('@dxworks/voyenv', {}, [])
        console.log(pluginInfo)
    })

    it('should find available plugins', () => {
        const availablePlugins = getAllAvailablePlugins({})
        console.log(availablePlugins)
        assert(Object.keys(availablePlugins).length > 0)
    })
})