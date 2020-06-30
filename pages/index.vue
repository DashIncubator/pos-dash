<template>
  <div>
    <v-btn color="success" nuxt to="/charge">New Sale</v-btn>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Date time</th>
            <th class="text-left">Username</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Status</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, idx) in transactions" :key="idx">
            <td>
              <timeago
                class="subtitle-1"
                :datetime="date(transaction.data.timestamp)"
                :auto-update="60"
              />
            </td>
            <td>{{ transaction.data.requesteeUserName }}</td>
            <td>
              {{ transaction.data.encFiatAmount }}
              {{ transaction.data.encFiatSymbol }}
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
  data() {
    return {
      transactions: [],
    }
  },
  async mounted() {
    const { fetchTransactions } = this
    this.transactions = await fetchTransactions()
  },
  methods: {
    ...mapActions(['fetchTransactions', 'refundTx']),
    date(timestamp: number) {
      return new Date(timestamp * 1000)
    },
    amountPaid(idx: number) {
      const tx: any = this.transactions[idx]
      const total = tx.utxos.items.reduce((acc: number, val: any) => {
        return acc + val.satoshis
      }, 0)
      return total
    },
    status(idx: number) {
      const { amountPaid, transactions } = this
      const tx: any = transactions[idx]
      if (tx.data.encSatoshis === amountPaid(idx).toString()) {
        return 'Paid'
      } else {
        return 'Pending'
      }
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
        this.refundTx({
          // @ts-ignore
          refundTxId: this.transactions[idx].utxos.items[0].txid,
          // @ts-ignore
          satoshis: parseInt(this.transactions[idx].data.encSatoshis),
        })
      }
      if (option === 'Amend') {
        // @ts-ignore
        const refId = this.transactions[idx].id
        // @ts-ignore
        const requesteeUserName = this.transactions[idx].data.requesteeUserName
        // @ts-ignore
        const requesteeUserId = this.transactions[idx].data.requesteeUserId
        // @ts-ignore
        const fiatAmount = this.transactions[idx].data.encFiatAmount
        const POSOpts = {
          refId,
          requesteeUserId,
          requesteeUserName,
          fiatAmount,
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
