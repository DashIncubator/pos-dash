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
      <v-card color="#012060" min-width="275px"
        ><v-card-title class="text-center">Waiting for payment</v-card-title>
        <div v-if="!isPaid" class="loadcontainer">
          <div class="holder">
            <div class="box"></div>
          </div>
          <div class="holder">
            <div class="box"></div>
          </div>
          <div class="holder">
            <div class="box"></div>
          </div>
        </div>
        <v-spacer style="height: 40px;" />
        <v-spacer v-if="!isPaid" style="height: 100px;" />
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
        <v-spacer style="height: 40px;" />
        <v-card-text class="text-center"
          ><span v-if="satoshisReceived > 0"
            >Received {{ satoshisReceived }} / {{ satoshisRequested }}</span
          >&nbsp;</v-card-text
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
    async pollWaitForPayment(document: any) {
      console.log('document :>> ', document)
      // @ts-ignore
      this.satoshisRequested = document.encSatoshis
      // console.log(
      //   'this.getUTXO(document.encAddress) :>> ',
      //   await this.getUTXO(document.encAddress)
      // )
      // @ts-ignore
      const summary = await this.getAddressSummary(document.encAddress)

      // @ts-ignore
      this.satoshisReceived = summary.unconfirmedBalanceSat
      // @ts-ignore
      if (this.satoshisReceived >= document.encSatoshis) {
        // @ts-ignore
        this.isPaid = true
        setTimeout(() => {
          // this.waitingForPayment = false
          this.$router.push('/')
        }, 5000)
      } else {
        await sleep(2000)
        // @ts-ignore
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
      // @ts-ignore
      this.pollWaitForPayment(document)
    },
  },
})
</script>

<style scoped>
*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  background: #012060;
}

.loadcontainer {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-perspective: 2000px;
  perspective: 2000px;
  -webkit-transform: rotateX(-30deg) rotateY(-45deg);
  transform: rotateX(-30deg) rotateY(-45deg);
}

.holder {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-transform: translate3d(0em, 3em, 1.5em);
  transform: translate3d(0em, 3em, 1.5em);
}
.holder:last-child {
  -webkit-transform: rotateY(-90deg) rotateX(90deg) translate3d(0, 3em, 1.5em);
  transform: rotateY(-90deg) rotateX(90deg) translate3d(0, 3em, 1.5em);
}
.holder:first-child {
  -webkit-transform: rotateZ(-90deg) rotateX(-90deg) translate3d(0, 3em, 1.5em);
  transform: rotateZ(-90deg) rotateX(-90deg) translate3d(0, 3em, 1.5em);
}
.holder:nth-child(1) .box {
  background-color: #008de4;
}
.holder:nth-child(1) .box:before {
  background-color: #004e7e;
}
.holder:nth-child(1) .box:after {
  background-color: #006db1;
}
.holder:nth-child(2) .box {
  background-color: #787878;
}
.holder:nth-child(2) .box:before {
  background-color: #454545;
}
.holder:nth-child(2) .box:after {
  background-color: #5f5f5f;
}
.holder:nth-child(3) .box {
  background-color: #ffffff;
}
.holder:nth-child(3) .box:before {
  background-color: #cccccc;
}
.holder:nth-child(3) .box:after {
  background-color: #e6e6e6;
}

.box {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  -webkit-animation: ani-box 6s infinite;
  animation: ani-box 6s infinite;
  width: 3em;
  height: 3em;
}
.box:before,
.box:after {
  position: absolute;
  width: 100%;
  height: 100%;
  content: '';
}
.box:before {
  left: 100%;
  bottom: 0;
  -webkit-transform: rotateY(90deg);
  transform: rotateY(90deg);
  -webkit-transform-origin: 0 50%;
  transform-origin: 0 50%;
}
.box:after {
  left: 0;
  bottom: 100%;
  -webkit-transform: rotateX(90deg);
  transform: rotateX(90deg);
  -webkit-transform-origin: 0 100%;
  transform-origin: 0 100%;
}

@-webkit-keyframes ani-box {
  8.33% {
    -webkit-transform: translate3d(-50%, -50%, 0) scaleZ(2);
    transform: translate3d(-50%, -50%, 0) scaleZ(2);
  }
  16.7% {
    -webkit-transform: translate3d(-50%, -50%, -3em) scaleZ(1);
    transform: translate3d(-50%, -50%, -3em) scaleZ(1);
  }
  25% {
    -webkit-transform: translate3d(-50%, -100%, -3em) scaleY(2);
    transform: translate3d(-50%, -100%, -3em) scaleY(2);
  }
  33.3% {
    -webkit-transform: translate3d(-50%, -150%, -3em) scaleY(1);
    transform: translate3d(-50%, -150%, -3em) scaleY(1);
  }
  41.7% {
    -webkit-transform: translate3d(-100%, -150%, -3em) scaleX(2);
    transform: translate3d(-100%, -150%, -3em) scaleX(2);
  }
  50% {
    -webkit-transform: translate3d(-150%, -150%, -3em) scaleX(1);
    transform: translate3d(-150%, -150%, -3em) scaleX(1);
  }
  58.3% {
    -webkit-transform: translate3d(-150%, -150%, 0) scaleZ(2);
    transform: translate3d(-150%, -150%, 0) scaleZ(2);
  }
  66.7% {
    -webkit-transform: translate3d(-150%, -150%, 0) scaleZ(1);
    transform: translate3d(-150%, -150%, 0) scaleZ(1);
  }
  75% {
    -webkit-transform: translate3d(-150%, -100%, 0) scaleY(2);
    transform: translate3d(-150%, -100%, 0) scaleY(2);
  }
  83.3% {
    -webkit-transform: translate3d(-150%, -50%, 0) scaleY(1);
    transform: translate3d(-150%, -50%, 0) scaleY(1);
  }
  91.7% {
    -webkit-transform: translate3d(-100%, -50%, 0) scaleX(2);
    transform: translate3d(-100%, -50%, 0) scaleX(2);
  }
  100% {
    -webkit-transform: translate3d(-50%, -50%, 0) scaleX(1);
    transform: translate3d(-50%, -50%, 0) scaleX(1);
  }
}

@keyframes ani-box {
  8.33% {
    -webkit-transform: translate3d(-50%, -50%, 0) scaleZ(2);
    transform: translate3d(-50%, -50%, 0) scaleZ(2);
  }
  16.7% {
    -webkit-transform: translate3d(-50%, -50%, -3em) scaleZ(1);
    transform: translate3d(-50%, -50%, -3em) scaleZ(1);
  }
  25% {
    -webkit-transform: translate3d(-50%, -100%, -3em) scaleY(2);
    transform: translate3d(-50%, -100%, -3em) scaleY(2);
  }
  33.3% {
    -webkit-transform: translate3d(-50%, -150%, -3em) scaleY(1);
    transform: translate3d(-50%, -150%, -3em) scaleY(1);
  }
  41.7% {
    -webkit-transform: translate3d(-100%, -150%, -3em) scaleX(2);
    transform: translate3d(-100%, -150%, -3em) scaleX(2);
  }
  50% {
    -webkit-transform: translate3d(-150%, -150%, -3em) scaleX(1);
    transform: translate3d(-150%, -150%, -3em) scaleX(1);
  }
  58.3% {
    -webkit-transform: translate3d(-150%, -150%, 0) scaleZ(2);
    transform: translate3d(-150%, -150%, 0) scaleZ(2);
  }
  66.7% {
    -webkit-transform: translate3d(-150%, -150%, 0) scaleZ(1);
    transform: translate3d(-150%, -150%, 0) scaleZ(1);
  }
  75% {
    -webkit-transform: translate3d(-150%, -100%, 0) scaleY(2);
    transform: translate3d(-150%, -100%, 0) scaleY(2);
  }
  83.3% {
    -webkit-transform: translate3d(-150%, -50%, 0) scaleY(1);
    transform: translate3d(-150%, -50%, 0) scaleY(1);
  }
  91.7% {
    -webkit-transform: translate3d(-100%, -50%, 0) scaleX(2);
    transform: translate3d(-100%, -50%, 0) scaleX(2);
  }
  100% {
    -webkit-transform: translate3d(-50%, -50%, 0) scaleX(1);
    transform: translate3d(-50%, -50%, 0) scaleX(1);
  }
}

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
