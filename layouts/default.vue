<template>
  <v-app>
    <v-main>
      <v-container>
        <nuxt />
        <v-overlay
          color="#012060FF"
          :value="!this.$store.state.isClientWalletSynced"
        >
          <!-- <v-overlay :value="false"> -->
          <div class="loadcontainer">
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
          <!-- <v-progress-circular indeterminate size="64"></v-progress-circular> -->
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
</style>
