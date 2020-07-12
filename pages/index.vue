<template>
  <div>
    <v-banner sticky outlined style="background: white;">
      <v-row>
        <v-col style="max-width: 150px;">
          <qrcode
            :value="$store.state.name.label"
            tag="img"
            style="margin-to: -5px;"
          ></qrcode>
        </v-col>
        <v-col
          ><v-card elevation="0"
            ><v-card-title> {{ $store.state.name.label }} </v-card-title>
            <v-card-text
              >Ask the customer to scan the QR Code to initiate a Payment
              Request</v-card-text
            >
          </v-card></v-col
        >
      </v-row>
    </v-banner>

    <PaymentIntents />
    <!-- <v-btn class="my-10" color="success" nuxt to="/charge">New Sale</v-btn> -->
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
