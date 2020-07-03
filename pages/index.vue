<template>
  <div>
    <v-banner sticky outlined="">
      <qrcode
        :value="$store.state.name.label"
        tag="img"
        style="margin-to: -5px;"
      ></qrcode>
    </v-banner>

    <PaymentIntents />
    <v-btn class="my-10" color="success" nuxt to="/charge">New Sale</v-btn>
    <PaymentRequestHistory />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import { mapActions } from 'vuex'
// @ts-ignore
import VueQrcode from '@chenfengyuan/vue-qrcode'
import PaymentRequestHistory from '../components/PaymentRequestHistory.vue'
import PaymentIntents from '../components/PaymentIntents.vue'

Vue.component(VueQrcode.name, VueQrcode)
export default Vue.extend({
  components: { PaymentRequestHistory, PaymentIntents },
  data() {
    return {}
  },
  async mounted() {},
  methods: {},
})
</script>

<style scoped></style>
