<template>
  <div>
    <PaymentIntents />
    <v-btn class="my-10" color="success" nuxt to="/charge">New Sale</v-btn>
    <PaymentRequestHistory />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import PaymentRequestHistory from '../components/PaymentRequestHistory.vue'
import PaymentIntents from '../components/PaymentIntents.vue'

export default Vue.extend({
  components: { PaymentRequestHistory, PaymentIntents },
  data() {
    return {}
  },
  async mounted() {},
  methods: {
    ...mapActions(['fetchTransactions', 'refundTx']),
  },
})
</script>

<style scoped></style>
