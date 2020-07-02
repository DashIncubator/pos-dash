<template>
  <div>
    <v-alert v-if="mode === 'Amend'" color="blue" outlined=""
      >Amending Request: {{ refId }}</v-alert
    >
    <v-alert v-if="mode === 'Intent'" color="green" outlined=""
      >New Sale for Intent: {{ refId }}</v-alert
    >
    <v-alert v-if="mode === 'newSale'" color="green" outlined=""
      >New Sale</v-alert
    >
    <p>Customer name:</p>
    <p v-if="mode === 'Amend'">{{ customer.split(':')[0] }}</p>
    <p v-if="mode === 'Intent'">{{ customer.split(':')[0] }}</p>
    <NameAutocomplete v-if="mode === 'newSale'" v-model="customer" />
    <v-overflow-btn
      v-model="fiatSymbol"
      :items="[
        'USD',
        'EUR',
        'BRL',
        'COP',
        'VES',
        'AED',
        'AFN',
        'ALL',
        'AMD',
        'ANG',
        'AOA',
        'ARS',
        'AUD',
        'AWG',
        'AZN',
        'BAM',
        'BBD',
        'BDT',
        'BGN',
        'BHD',
        'BIF',
        'BMD',
        'BND',
        'BOB',
        'BSD',
        'BTC',
        'BTN',
        'BWP',
        'BYN',
        'BZD',
        'CAD',
        'CDF',
        'CHF',
        'CLF',
        'CLP',
        'CNH',
        'CNY',
        'CRC',
        'CUC',
        'CUP',
        'CVE',
        'CZK',
        'DJF',
        'DKK',
        'DOP',
        'DZD',
        'EGP',
        'ERN',
        'ETB',
        'ETH',
        'FJD',
        'FKP',
        'GBP',
        'GEL',
        'GGP',
        'GHS',
        'GIP',
        'GMD',
        'GNF',
        'GTQ',
        'GYD',
        'HKD',
        'HNL',
        'HRK',
        'HTG',
        'HUF',
        'IDR',
        'ILS',
        'IMP',
        'INR',
        'IQD',
        'IRR',
        'ISK',
        'JEP',
        'JMD',
        'JOD',
        'JPY',
        'KES',
        'KGS',
        'KHR',
        'KMF',
        'KPW',
        'KRW',
        'KWD',
        'KYD',
        'KZT',
        'LAK',
        'LBP',
        'LKR',
        'LRD',
        'LSL',
        'LTC',
        'LYD',
        'MAD',
        'MDL',
        'MGA',
        'MKD',
        'MMK',
        'MNT',
        'MOP',
        'MRO',
        'MUR',
        'MVR',
        'MWK',
        'MXN',
        'MYR',
        'MZN',
        'NAD',
        'NGN',
        'NIO',
        'NOK',
        'NPR',
        'NZD',
        'OMR',
        'PAB',
        'PEN',
        'PGK',
        'PHP',
        'PKR',
        'PLN',
        'PYG',
        'QAR',
        'RON',
        'RSD',
        'RUB',
        'RWF',
        'SAR',
        'SBD',
        'SCR',
        'SDG',
        'SEK',
        'SGD',
        'SHP',
        'SLL',
        'SOS',
        'SRD',
        'SSP',
        'STD',
        'SVC',
        'SYP',
        'SZL',
        'THB',
        'TJS',
        'TMT',
        'TND',
        'TOP',
        'TRY',
        'TTD',
        'TWD',
        'TZS',
        'UAH',
        'UGX',
        'USD',
        'UYU',
        'UZS',
        'VEF',
        'VND',
        'VUV',
        'WST',
        'XAF',
        'XAG',
        'XAU',
        'XCD',
        'XDR',
        'XOF',
        'XPD',
        'XPF',
        'XPT',
        'YER',
        'ZAR',
        'ZMW',
      ]"
      label="Currency"
    ></v-overflow-btn>
    <v-text-field v-model="memo" label="Order Description"></v-text-field>
    <v-text-field
      v-model="fiatAmount"
      label="Order Amount"
      type="number"
    ></v-text-field>
    <v-btn color="success" @click="reqPayment">Confirm</v-btn>
    <v-btn color="error" nuxt to="/">Cancel</v-btn>
    <v-overlay :value="waitingForPayment">
      <!-- <v-overlay> -->
      <v-card
        ><v-card-title>Waiting for payment</v-card-title>
        <svg
          v-if="!isPaid"
          class="checkspace"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        />
        <svg
          v-if="isPaid"
          class="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            class="checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            class="checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
        <v-card-text class="text-center"
          >Received {{ satoshisReceived }} /
          {{ satoshisRequested }}</v-card-text
        >
        <v-card-actions>
          <v-btn v-if="!isPaid" class="mx-auto" nuxt to="/" color="red"
            >Cancel</v-btn
          >
          <v-btn v-if="isPaid" class="mx-auto" nuxt to="/" color="green"
            >Done</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-overlay>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
// @ts-ignore
import NameAutocomplete from '../components/NameAutocomplete'
// const timestamp = () => Math.floor(Date.now() / 1000)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Vue.extend({
  components: { NameAutocomplete },
  data() {
    return {
      mode: 'newSale',
      memo: '',
      fiatAmount: 0,
      refId: '',
      customer: null,
      waitingForPayment: false,
      satoshisReceived: 0,
      satoshisRequested: -1,
      isPaid: false,
    }
  },
  computed: {
    fiatSymbol: {
      get() {
        // @ts-ignore
        return this.$store.state.pos.currency
      },
      set(value) {
        // @ts-ignore
        this.$store.commit('setPosCurrency', value)
      },
    },
  },
  created() {
    // @ts-ignore
    this.mode = this.$store.state.pos.mode
    // @ts-ignore
    this.customer = `${this.$store.state.pos.requesteeUserName}:${this.$store.state.pos.requesteeUserId}`
    // @ts-ignore
    this.fiatAmount = this.$store.state.pos.fiatAmount
    // @ts-ignore
    this.refId = this.$store.state.pos.refId
    // @ts-ignore
    console.log(this.customer, this.fiatAmount, this.refId)
    this.$store.commit('resetPOSOptions')
  },
  methods: {
    ...mapActions(['requestFiat', 'getUTXO', 'getAddressSummary']),
    async pollWaitForPayment(document) {
      console.log('document :>> ', document)
      this.satoshisRequested = document.encSatoshis
      // console.log(
      //   'this.getUTXO(document.encAddress) :>> ',
      //   await this.getUTXO(document.encAddress)
      // )
      const summary = await this.getAddressSummary(document.encAddress)

      this.satoshisReceived = summary.unconfirmedBalanceSat
      if (this.satoshisReceived >= document.encSatoshis) {
        this.isPaid = true
        setTimeout(() => {
          this.waitingForPayment = false
          this.$router.push('/')
        }, 5000)
      } else {
        await sleep(2000)
        this.pollWaitForPayment(document)
      }
    },
    async reqPayment() {
      // @ts-ignore
      this.waitingForPayment = true
      // @ts-ignore
      // eslint-disable-next-line prettier/prettier
      const { customer, fiatAmount, fiatSymbol, memo, refId, requestFiat } = this
      console.log('fiatAmount :>> ', fiatAmount)
      console.log('fiatSymbol :>> ', fiatSymbol)
      console.log('memo :>> ', memo)
      console.log('customer :>> ', customer)
      const [requesteeUserName, requesteeUserId] = customer.split(':')
      const document = await requestFiat({
        requesteeUserId,
        requesteeUserName,
        fiatAmount,
        fiatSymbol,
        refId,
        memo,
      })
      console.log('request fiat document :>> ', document)
      console.log('request fiat address :>> ', document.encAddress)
      this.pollWaitForPayment(document)
    },
  },
})
</script>

<style scoped>
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #7ac142;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkspace {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  margin: 10% auto;
  box-shadow: inset 0px 0px 0px 30px blue;
}
.checkmark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 10% auto;
  box-shadow: inset 0px 0px 0px #7ac142;
  animation: fill 0.4s ease-in-out 0.4s forwards,
    scale 0.3s ease-in-out 0.9s both;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes scale {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}
@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #7ac142;
  }
}
</style>
