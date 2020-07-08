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
                :datetime="date(paymentRequest.data.timestamp)"
                :auto-update="60"
              />
            </td>
            <td>{{ paymentRequest.data.requesteeUserName }}</td>
            <td>
              {{
                paymentRequest.data.encFiatAmount === '0'
                  ? '-'
                  : paymentRequest.data.encFiatAmount
              }}
              {{ paymentRequest.data.encFiatSymbol }}
            </td>
            <td>{{ status(idx) }}</td>
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

export default Vue.extend({
  data: () => {
    const data: {
      paymentRequests: any
    } = {
      paymentRequests: {},
    }
    return data
  },
  async mounted() {
    const { fetchPaymentRequests } = this
    this.paymentRequests = [...(await fetchPaymentRequests())]
  },
  methods: {
    ...mapActions(['fetchPaymentRequests', 'refundPaymentRequest']),
    date(timestamp: number) {
      return new Date(timestamp * 1000)
    },
    amountPaid(idx: number) {
      const pr: any = this.paymentRequests[idx]
      const total = pr.utxos.items.reduce((acc: number, val: any) => {
        return acc + val.satoshis
      }, 0)
      return total
    },
    info(idx: number) {
      const { amountPaid, paymentRequests } = this
      const pr: any = paymentRequests[idx]
      const infoT =
        pr.data.encAddress +
        ' ' +
        pr.data.encSatoshis +
        ' ' +
        amountPaid(idx) +
        ' ' +
        // JSON.stringify(pr.utxos) +
        pr.data.refId.slice(-4) +
        ' ' +
        pr.summary.txAppearances
      return infoT
    },
    status(idx: number) {
      const { amountPaid, paymentRequests } = this
      const pr: any = paymentRequests[idx]

      if (pr.data.encSatoshis === '0') return 'Cancelled' // Must be first to return
      if (pr.data.encSatoshis === amountPaid(idx).toString()) {
        return 'Paid'
      }

      if (
        amountPaid(idx) === 0 &&
        pr.utxos.totalItems === 0 &&
        pr.summary.txAppearances > 1
      ) {
        return 'Refunded'
      }

      if (
        amountPaid(idx) === 0 &&
        pr.utxos.totalItems === 0 &&
        pr.summary.txAppearances === 0
      )
        return 'Pending'
    },
    options(idx: number) {
      const status = this.status(idx) // should be a computed
      if (status === 'Pending') {
        return ['Amend', 'Cancel']
      }
      if (status === 'Paid') {
        return ['Refund', 'Amend']
      }
      if (status === 'Cancelled') {
        return ['']
      }
    },
    execOption(option: any, idx: number) {
      if (option === 'Refund') {
        const requestDocument = this.paymentRequests[idx]
        this.refundPaymentRequest({ requestDocument })
      }
      if (option === 'Amend') {
        const refId = this.paymentRequests[idx].id

        const {
          requesteeUserName,
          requesteeUserId,
          encFiatAmount,
        } = this.paymentRequests[idx].data

        const prevDocument = this.paymentRequests[idx]

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
