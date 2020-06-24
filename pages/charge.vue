<template>
  <div>
    <p>Customer name:</p>
    <NameAutocomplete v-model="customer" />
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
    <v-btn color="error">Cancel</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
// @ts-ignore
import NameAutocomplete from '../components/NameAutocomplete'
// const timestamp = () => Math.floor(Date.now() / 1000)

export default Vue.extend({
  components: { NameAutocomplete },
  data() {
    return {
      memo: '',
      fiatAmount: 0,
      customer: null,
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
  methods: {
    ...mapActions(['requestFiat']),
    reqPayment() {
      // @ts-ignore
      const { customer, fiatAmount, fiatSymbol, memo, requestFiat } = this
      console.log('fiatAmount :>> ', fiatAmount)
      console.log('fiatSymbol :>> ', fiatSymbol)
      console.log('memo :>> ', memo)
      console.log('customer :>> ', customer)
      const [requesteeUserName, requesteeUserId] = customer.split(':')
      requestFiat({
        requesteeUserId,
        requesteeUserName,
        fiatAmount,
        fiatSymbol,
        memo,
      })
    },
  },
})
</script>

<style scoped></style>
