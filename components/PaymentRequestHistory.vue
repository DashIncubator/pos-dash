<template>
  <div>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Date time</th>
            <th class="text-left">Username</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Status</th>
            <th class="text-left">Actions</th>
            <th class="text-left">Info</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(paymentRequest, idx) in paymentRequests" :key="idx">
            <td>
              <timeago
                class="subtitle-1"
                :datetime="date(paymentRequest.docs[0].timestamp)"
                :auto-update="60"
              />
            </td>
            <td>{{ paymentRequest.docs[0].requesteeUserName }}</td>
            <td>
              {{
                paymentRequest.docs[0].encFiatAmount === '0'
                  ? '-'
                  : paymentRequest.docs[0].encFiatAmount
              }}
              {{ paymentRequest.docs[0].encFiatSymbol }}
            </td>
            <td>{{ paymentRequest.status }}</td>
            <td>
              <v-btn
                v-for="(option, idy) in options(idx)"
                :key="idy"
                text
                small
                dense
                color="blue"
                @click="execOption(option, idx)"
              >
                {{ option }}
              </v-btn>
            </td>
            <td>{{ info(idx) }}</td>
          </tr>
          <tr>
            <td>Feb 12th, 5:15pm</td>
            <td>Alice</td>
            <td>$5</td>
            <td>Pending</td>
            <td>Amend, Cancel</td>
          </tr>
          <tr>
            <td>Feb 12th, 5:15pm</td>
            <td>Bob</td>
            <td>$3.50</td>
            <td>Paid</td>
            <td>Refund, Amend</td>
          </tr>
          <tr>
            <td>Feb 12th, 5:15pm</td>
            <td>Carol</td>
            <td>$4.50</td>
            <td>Refunded</td>
            <td>Amend</td>
          </tr>
          <tr>
            <td>Feb 12th, 5:15pm</td>
            <td>David</td>
            <td>$4.50</td>
            <td>Cancelled</td>
            <td>-</td>
          </tr>
          <!-- <tr v-for="item in desserts" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.calories }}</td>
          </tr> -->
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default Vue.extend({
  data: () => {
    const data: {
      paymentRequests: any
    } = {
      paymentRequests: {},
    }
    return data
  },
  created() {
    this.refreshPaymentRequests()
  },
  methods: {
    ...mapActions([
      'fetchPaymentRequests',
      'refundPaymentRequest',
      'requestPayment',
      'cancelPaymentRequest',
    ]),
    async refreshPaymentRequests() {
      this.paymentRequests = await this.fetchPaymentRequests()
    },
    // async pollFetchPaymentRequests() {
    //   this.paymentRequests = await this.fetchPaymentRequests()
    //   await sleep(2000)
    //   this.pollFetchPaymentRequests()
    // },
    date(timestamp: number) {
      return new Date(timestamp * 1000)
    },
    amountPaid(idx: number) {
      // const pr: any = {this.paymentRequests[idx].docs[0]
      const total = this.paymentRequests[idx].utxos.items.reduce(
        (acc: number, val: any) => {
          return acc + val.satoshis
        },
        0
      )
      return total
    },
    info(idx: number) {
      const { amountPaid, paymentRequests } = this
      const pr: any = {
        ...paymentRequests[idx].docs[0],
        summary: paymentRequests[idx].summary,
        utxos: paymentRequests[idx].utxos,
      }
      const infoT =
        pr.encAddress +
        ' ' +
        pr.encSatoshis +
        ' ' +
        amountPaid(idx) +
        ' ' +
        // JSON.stringify(pr.utxos) +
        pr.refId.slice(-4) +
        ' ' +
        pr.summary.txAppearances
      return infoT
    },
    options(idx: number) {
      const { status } = this.paymentRequests[idx]
      if (status === 'Pending') {
        return ['Amend', 'Cancel']
      }
      if (status === 'Paid') {
        return ['Refund', 'Amend']
      }
      if (status === 'Refunded') {
        return ['Amend']
      }
      if (status === 'Cancelled') {
        return ['']
      }
    },
    async execOption(option: any, idx: number) {
      console.log('exec option', option)
      if (option === 'Cancel') {
        console.log('pending')
        const requestDocument = this.paymentRequests[idx].docs[0]
        await this.cancelPaymentRequest(requestDocument)
        this.$store.commit('showSnackbar', {
          text: `Cancelled PaymentRequest ${requestDocument.refId}`,
          color: 'success',
        })
        await sleep(1000)
        this.refreshPaymentRequests()
      }
      if (option === 'Refund') {
        const requestDocument = this.paymentRequests[idx].docs[0]

        const {
          requesteeUserId,
          requesteeUserName,
          memo,
          refId,
          encAddress,
        } = requestDocument

        await this.requestPayment({
          requesteeUserId,
          requesteeUserName,
          satoshis: 0,
          memo: memo + ' -> Refund',
          refId,
          fiatAmount: 0,
          fiatSymbol: '',
          address: encAddress,
        })

        await this.refundPaymentRequest({ requestDocument })
        await sleep(1000)
        this.refreshPaymentRequests()
      }
      if (option === 'Amend') {
        const refId = this.paymentRequests[idx].docs[0].refId

        const {
          requesteeUserName,
          requesteeUserId,
          encFiatAmount,
        } = this.paymentRequests[idx].docs[0]

        const prevDocument = this.paymentRequests[idx].docs[0]

        const POSOpts = {
          refId,
          requesteeUserId,
          requesteeUserName,
          fiatAmount: encFiatAmount,
          prevDocument,
          mode: option,
        }

        this.$store.commit('setPOSOptions', POSOpts)
        this.$router.push('/charge')
      }
    },
  },
})
</script>

<style scoped></style>
