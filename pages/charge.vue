<template>
  <v-card class="mx-auto pa-2" max-width="550px">
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
    <v-text-field v-model="memo" label="Order Description"></v-text-field>
    <v-card-actions>
      <v-text-field
        v-model="fiatAmount"
        label="Order Amount"
        type="number"
        step="0.01"
        min="0"
      ></v-text-field>
      <v-overflow-btn
        v-model="fiatSymbol"
        class="mb-3"
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
    </v-card-actions>
    <v-btn color="error" nuxt to="/">Cancel</v-btn>
    <v-btn
      :disabled="!confirmCaption.enabled"
      :color="confirmCaption.color || 'success'"
      @click="sendRequest"
      >{{ confirmCaption.text }}</v-btn
    >
    <v-overlay :value="waitingForPayment">
      <!-- <v-overlay> -->
      <v-card color="#012060" min-width="285px"
        ><v-card-title class="text-center mx-auto"
          >Payment Request</v-card-title
        >
        <div v-if="!isPaid" class="loadcontainer mt-n8">
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
        <v-spacer v-if="!isPaid" style="height: 120px;" />
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
        <v-spacer style="height: 50px;" />
        <v-card-text class="text-center">
          From: {{ customer.split(':')[0] }} <br />
          Amount: {{ fiatAmount }} {{ fiatSymbol }}<br />
          <span v-if="satoshisReceived > 0">
            Received {{ dashReceived }} / {{ dashRequested }} Dash</span
          >
          <span v-else>Waiting .. </span>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="!isPaid"
            class="mx-auto"
            color="red"
            @click="cancelRequest()"
            >Cancel</v-btn
          >
          <v-btn
            v-if="!isPaid"
            class="mx-auto"
            color="blue"
            @click="waitingForPayment = false"
            >Amend</v-btn
          >
          <v-btn v-if="isPaid" class="mx-auto" nuxt to="/" color="green"
            >Done</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'
import { Unit } from '@dashevo/dashcore-lib'
import NameAutocomplete from '../components/NameAutocomplete.vue'

// const timestamp = () => Math.floor(Date.now() / 1000)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Vue.extend({
  components: { NameAutocomplete },
  data: () => {
    const data: {
      mode: string
      memo: string
      status: string
      prevDocument: any
      fiatAmount: number
      refId: string
      customer: string
      waitingForPayment: boolean
      satoshisReceived: number
      satoshisRequested: number
      isPaid: boolean
      document: any
    } = {
      mode: 'newSale',
      status: '',
      memo: '',
      prevDocument: {},
      fiatAmount: 0,
      refId: '',
      customer: ':',
      waitingForPayment: false,
      satoshisReceived: 0,
      satoshisRequested: -1,
      isPaid: false,
      document: {},
    }
    return data
  },
  computed: {
    dashReceived() {
      return Unit.fromSatoshis(this.satoshisReceived).toBTC()
    },
    dashRequested() {
      return Unit.fromSatoshis(this.satoshisRequested).toBTC()
    },
    fiatSymbol: {
      get(): string {
        return this.$store.state.pos.currency
      },
      set(value: string) {
        this.$store.commit('setPosCurrency', value)
      },
    },
    // eslint-disable-next-line vue/return-in-computed-property
    confirmCaption() {
      let fiatDifference =
        Math.round(
          this.fiatAmount * 100 - this.prevDocument?.encFiatAmount * 100
        ) / 100

      // If status is fully refunded, use full fiatAmount in PaymentRequest
      if (this.status === 'Refunded')
        fiatDifference = Math.round(this.fiatAmount * 100) / 100

      if (fiatDifference < 0) {
        // @ts-ignore
        return {
          color: 'blue',
          // @ts-ignore
          text: `Decrease: ${fiatDifference} ${this.fiatSymbol}`,
          enabled: true,
        }
      } else if (fiatDifference > 0) {
        // @ts-ignore
        return {
          // @ts-ignore
          text: `Increase: ${fiatDifference} ${this.fiatSymbol}`,
          enabled: true,
        }
      } else if (this.fiatAmount > 0) {
        return { text: 'Confirm', enabled: true }
      } else {
        return { text: 'Confirm' }
      }
    },
  },
  created() {
    this.mode = this.$store.state.pos.mode
    this.customer = `${this.$store.state.pos.requesteeUserName}:${this.$store.state.pos.requesteeUserId}`
    this.prevDocument = this.$store.state.pos.prevDocument
    this.fiatAmount = this.$store.state.pos.fiatAmount
    this.refId = this.$store.state.pos.refId
    this.status = this.$store.state.pos.status
    console.log(this.customer, this.fiatAmount, this.refId)
    this.$store.commit('resetPOSOptions')
  },
  methods: {
    ...mapActions([
      'requestFiat',
      'requestPayment',
      'getAddressSummary',
      'refundPaymentRequest',
    ]),
    async sendRequest() {
      console.log('this.mode :>> ', this.mode)
      if (this.mode === 'Amend') {
        const { fiatAmount, memo, prevDocument } = this

        const {
          requesteeUserId,
          requesteeUserName,
          refId,
          encSatoshis,
          encFiatSymbol,
          encAddress,
        } = prevDocument

        // if (fiatAmount >= parseFloat(prevDocument.encFiatAmount)) {
        //   this.reqPayment()
        //   return
        // }

        const prevFiatAmount = prevDocument.encFiatAmount

        // Use original fiat conversion rate
        const rate = parseFloat(prevFiatAmount) / parseFloat(encSatoshis)
        console.log('rate :>> ', rate)

        const refundFiatAmount =
          Math.round(parseFloat(prevFiatAmount) * 100 - fiatAmount * 100) / 100
        const refundSatoshis = Math.floor(refundFiatAmount / rate)
        console.log('refundSatoshis :>> ', refundSatoshis)

        // Payment Request amount in satoshis
        const satoshis = encSatoshis - refundSatoshis
        console.log('satoshis :>> ', satoshis)

        // Check how much was already paid, then open dialog to request the difference or go on to send a partial refund
        const summary = await this.getAddressSummary(encAddress)
        console.log('summary :>> ', summary)

        if (summary.totalBalanceSat <= satoshis) {
          this.reqPayment()
          return
        }

        this.$store.commit('showSnackbar', {
          text: `Refunding ${refundFiatAmount} ${encFiatSymbol} to ${requesteeUserName}`,
          color: 'blue',
        })

        await this.requestPayment({
          requesteeUserId,
          requesteeUserName,
          satoshis,
          memo,
          refId,
          fiatAmount,
          fiatSymbol: encFiatSymbol,
          address: encAddress,
        })

        await this.refundPaymentRequest({
          requestDocument: this.prevDocument,
          satoshis: refundSatoshis,
        })
        this.$router.push('/')
      }

      if (this.mode === 'Intent') {
        this.reqPayment()
      }
    },
    async pollWaitForPayment(): Promise<void> {
      const { document } = this
      // console.log('document :>> ', document)
      this.satoshisRequested = document.encSatoshis
      // console.log(
      //   'this.getUTXO(document.encAddress) :>> ',
      //   await this.getUTXO(document.encAddress)
      // )
      const summary = await this.getAddressSummary(document.encAddress)

      this.satoshisReceived = summary.totalBalanceSat
      if (this.satoshisReceived >= document.encSatoshis) {
        this.isPaid = true
        setTimeout(() => {
          // this.waitingForPayment = false
          this.$router.push('/')
        }, 5000)
      } else {
        await sleep(2000)
        this.pollWaitForPayment()
      }
    },
    async cancelRequest() {
      const { document, prevDocument, requestPayment, $router } = this
      let cancelDocument

      // Roll back to previous request or set satoshis to 0 if this is the root request
      if (prevDocument.encSatoshis) {
        cancelDocument = prevDocument
        cancelDocument.satoshis = prevDocument.encSatoshis
        cancelDocument.fiatAmount = prevDocument.encFiatAmount
        cancelDocument.fiatSymbol = prevDocument.encFiatSymbol
        cancelDocument.address = prevDocument.encAddress
      } else {
        cancelDocument = document
        cancelDocument.satoshis = 0
        cancelDocument.fiatAmount = 0
        cancelDocument.address = document.encAddress
        cancelDocument.fiatSymbol = document.encFiatSymbol
      }

      console.log('cancel document :>> ', cancelDocument)
      await requestPayment(cancelDocument)

      $router.push('/')
    },
    async reqPayment() {
      this.waitingForPayment = true
      const {
        customer,
        fiatAmount,
        fiatSymbol,
        memo,
        refId,
        requestFiat,
        prevDocument,
      } = this
      console.log('fiatAmount :>> ', fiatAmount)
      console.log('fiatSymbol :>> ', fiatSymbol)
      console.log('memo :>> ', memo)
      console.log('customer :>> ', customer)

      const address = prevDocument?.encAddress
      console.log('previous Address :>> ', address)
      const [requesteeUserName, requesteeUserId] = customer.split(':')
      this.document = await requestFiat({
        requesteeUserId,
        requesteeUserName,
        fiatAmount,
        fiatSymbol,
        refId,
        memo,
        address,
      })
      console.log('request fiat document :>> ', this.document)
      this.pollWaitForPayment()
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
  /* top: 130px; */
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
