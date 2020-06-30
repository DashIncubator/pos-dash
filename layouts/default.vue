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
          :value="$store.state.snackbar.show"
          :top="'top'"
          :color="$store.state.snackbar.color"
        >
          {{ $store.state.snackbar.text }}
          <v-btn dark text @click="$store.commit('hideSnackbar')">
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
    return {}
  },
  created() {
    this.$store.dispatch('initWallet')
    // this.$store.watch(
    //   (state) => state.snackbar.time,
    //   () => {
    //     this.snackbar = JSON.parse(JSON.stringify(this.$store.state.snackbar))
    //   }
    // )
  },
  async beforeDestroy() {
    await this.$store.dispatch('disconnectWallet')
  },
})
</script>

<style scoped></style>
