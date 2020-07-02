<template>
  <div>
    <v-banner
      v-for="(intent, idx) in freshPaymentIntents"
      :key="idx"
      v-model="v0"
      sticky
      single-line
      outlined=""
      transition="slide-y-transition"
    >
      <v-avatar slot="icon" color="deep-purple accent-4" size="40">
        <v-icon icon="mdi-account" color="white">
          mdi-account
        </v-icon>
      </v-avatar>
      <b> {{ intent.requesteeUserName }} </b> is ready to pay.
      <template v-slot:actions="{ dismiss }">
        <v-btn
          dark
          color="green"
          @click="requestFromUserId(intent.requesteeUserId)"
          >Request Money</v-btn
        >
        <v-btn text color="red" @click="dismiss">Dismiss</v-btn>
      </template>
    </v-banner>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Vue.extend({
  data() {
    return { v0: true, paymentIntents: {} }
  },
  computed: {
    freshPaymentIntents() {
      // @ts-ignore
      const { paymentIntents } = this

      const sortable = []
      for (const intent in paymentIntents) {
        sortable.push(paymentIntents[intent])
      }
      console.log('sortable :>> ', sortable)

      sortable.sort(function (a, b) {
        return a[1].timestamp - b[1].timestamp
      })
      return sortable
    },
  },
  created() {
    this.pollPaymentIntents()
  },
  async mounted() {},
  methods: {
    ...mapActions(['queryDocuments']),
    requestFromUserId(requesteeUserId: string) {
      alert(requesteeUserId)
      const intent = this.paymentIntents[requesteeUserId]
      console.log('intent :>> ', intent)
      // @ts-ignore
      const refId = intent.$id
      // @ts-ignore
      const requesteeUserName = intent.requesteeUserName
      // @ts-ignore
      // @ts-ignore
      const fiatAmount = intent.encFiatAmount
      const POSOpts = {
        refId,
        requesteeUserId,
        requesteeUserName,
        fiatAmount,
        mode: 'Amend',
      }
      this.$store.commit('setPOSOptions', POSOpts)
      this.$router.push('/charge')
    },
    async pollPaymentIntents() {
      const queryOpts = {
        limit: 10,
        startAt: 1,
        orderBy: [['timestamp', 'desc']],
        where: [
          [
            'requesterUserId',
            '==',
            'B34j8pPUinnYbyWC6YAaL7viGexGmcbQdJ5SvPKqiH2Q',
            // this.$store.state.name.docId
          ],
        ],
      }
      const documents = await this.queryDocuments({
        contract: 'PaymentRequest',
        typeLocator: 'PaymentIntent',
        queryOpts,
      })
      //   this.paymentIntents = documents.map((doc: any) => doc.toJSON())
      this.paymentIntents = documents.reduce(function (map: any, obj: any) {
        map[obj.data.requesteeUserId] = obj.toJSON()
        return map
      }, {})
      console.log('this.paymentIntents :>> ', this.paymentIntents)
      console.log(Object.entries(this.paymentIntents))
      await sleep(6000)
      this.pollPaymentIntents()
    },
  },
})
</script>

<style scoped></style>
