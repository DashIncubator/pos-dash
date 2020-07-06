<template>
  <v-app>
    <v-main>
      <v-container>
        <nuxt />
        <!-- <v-overlay :value="!this.$store.state.isClientWalletSynced"> -->
        <v-overlay :value="false">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-overlay :value="this.$store.state.isClientError">
          <v-alert prominent type="error">
            <v-row align="center">
              <v-col class="headline">
                There was an error:
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="headline">
                {{ this.$store.state.clientErrorMsg }}
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="grow">
                Check your Network Connection and try to reload the page.
              </v-col>
            </v-row>
            <v-row align="center" justify="center">
              <v-col justify="center">
                <v-btn href="/">
                  Reload
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </v-overlay>
        <v-snackbar
          v-model="snackbar.show"
          :top="'top'"
          :color="snackbar.color"
        >
          {{ snackbar.text }}
          <v-btn dark text @click="snackbar.show = false">
            Close
          </v-btn>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      snackbar: { show: false, color: 'red', text: '', timestamp: 0 },
    }
  },
  created() {
    this.$store.dispatch('initWallet')
    this.$store.watch(
      (state) => state.snackbar.timestamp,
      () => {
        console.log('state.snackbar :>> ', this.$store.state.snackbar)
        this.snackbar = JSON.parse(JSON.stringify(this.$store.state.snackbar))
        console.log('this.snackbar :>> ', this.snackbar)
      }
    )
  },
  async beforeDestroy() {
    await this.$store.dispatch('disconnectWallet')
  },
})
</script>

<style scoped></style>
