<template>
  <v-autocomplete
    :loading="loading"
    :items="items"
    :search-input.sync="search"
    cache-items
    flat
    hide-no-data
    hide-details
    label="Customer name"
    solo
    :value="value"
    @input="$emit('input', $event)"
  ></v-autocomplete>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  props: { value: { type: String, default: '' } },
  data() {
    return {
      loading: false,
      items: [],
      search: null,
    }
  },
  watch: {
    async search(val) {
      console.log('val :>> ', val)
      console.log('this.value :>> ', this.value)
      console.log('this.querySelections(val) :>> ', this.querySelections(val))
      const curVal = this.value ? this.value.split(':')[0] : null
      console.log('curVal :>> ', curVal)
      val && val !== curVal && (await this.querySelections(val))
    },
  },
  methods: {
    ...mapActions(['searchDashNames']),
    async querySelections(v: string) {
      this.loading = true
      const dashNames = await this.searchDashNames(v)
      this.items = dashNames.map((name: any) => {
        return { text: name.data.label, value: `${name.data.label}:${name.id}` }
      })
      console.log('items :>> ', this.items)
      this.loading = false
    },
  },
})
</script>
