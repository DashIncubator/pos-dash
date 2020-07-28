import { GetterTree, ActionTree, MutationTree } from 'vuex'
import dashcore from '@dashevo/dashcore-lib'

// import { encrypt, decrypt } from 'dash-secure-message'
// const { Address, Unit } = dashcore;
const { Unit } = dashcore

const DashJS = require('dash')

const timestamp = () => Math.floor(Date.now() / 1000)
let client: any

const getInitState = (): any => ({
  mnemonic:
    'polar valve life beyond camera step erupt festival drama few body recall',
  identityId: '8j4wiCGuBMSYH3NDkfrhvJ44MqLYrfTBuyvHLoNaM3mX',
  name: {
    label: 'DashDonuts',
    docId: '8y5TPw1yq9Ypp81vqMitLJFjMQUYXeKQ12jmhq7rNCkE',
  },
  isClientError: false,
  clientErrorMsg: '',
  isClientWalletSynced: false,
  snackbar: { show: false, color: 'red', text: '', timestamp: 0 },
  pos: {
    currency: 'USD',
    requesteeUserId: '',
    requesteeUserName: '',
    refId: '',
    fiatAmount: 0,
    prevDocument: {},
    mode: 'newSale',
  },
  paymentIntentsVisible: {},
})

export const state = () => getInitState()

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  isError: (state) => state.isClientError,
}

export const mutations: MutationTree<RootState> = {
  dismissPaymentIntent: (state, docId: string) => {
    state.paymentIntentsVisible[docId] = false
  },
  setPOSOptions: (state, POSOpts) => {
    // state.pos.currency =
    state.pos.requesteeUserId = POSOpts.requesteeUserId
    state.pos.requesteeUserName = POSOpts.requesteeUserName
    state.pos.refId = POSOpts.refId
    state.pos.fiatAmount = POSOpts.fiatAmount
    state.pos.mode = POSOpts.mode
    state.pos.status = POSOpts.status
    state.pos.prevDocument = { ...POSOpts.prevDocument }
  },
  resetPOSOptions: (state) => {
    // state.pos.currency =
    state.pos.requesteeUserId = ''
    state.pos.requesteeUserName = ''
    state.pos.refId = ''
    state.pos.fiatAmount = 0
    state.pos.mode = 'newSale'
    state.pos.status = ''
    state.pos.prevDocument = {}
  },
  setClientWalletSynced: (state, isSynced) => {
    state.isClientWalletSynced = isSynced
  },
  setClientError: (state, clientErrorMsg: string) => {
    state.isClientError = true
    state.clientErrorMsg = clientErrorMsg
  },
  clearClientError: (state) => {
    state.isClientError = false
    state.clientErrorMsg = ''
  },
  hideSnackbar: (state) => {
    state.snackbar.show = false
    state.snackbar.text = ''
  },
  showSnackbar(state, { text, color = 'red' }) {
    state.snackbar.text = text
    state.snackbar.color = color
    state.snackbar.show = true
    state.snackbar.timestamp = timestamp()
  },
  setPosCurrency(state, symbol) {
    state.pos.currency = symbol
  },
}

export const actions: ActionTree<RootState, RootState> = {
  async isAccountReady({ dispatch }) {
    if (!client) {
      console.log('Client is not defined')
      await dispatch('initWallet')
    }
    if (!client?.account) {
      console.log('account is not defined')
      await dispatch('initWallet')
    }
  },
  async getUntouchedAddress({ dispatch, state }) {
    // Get untouchedAddress canditate
    let untouchedAddressCandidate = client.account.getUnusedAddress()
    console.log('untouchedAddress candidate :>> ', untouchedAddressCandidate)

    // Fetch latest published index doc
    const queryOpts = {
      limit: 1,
      startAt: 1,
      orderBy: [['index', 'desc']],
      where: [['$ownerId', '==', state.identityId]],
    }

    const results = await dispatch('queryDocuments', {
      contract: 'PaymentRequest',
      typeLocator: 'AddressIndex',
      queryOpts,
    })

    console.log('getUntouchedAddress doc results :>> ', results)
    const prevIndex = results[0]?.data.index || 0

    let nextIndex = Math.max(prevIndex + 1, untouchedAddressCandidate.index)
    console.log('nextIndex :>> ', nextIndex)

    let used = true
    while (used) {
      // Get final untouchedAddress based on nextIndex comparison with latest doc
      untouchedAddressCandidate = client.account.getAddress(nextIndex)
      console.log(
        'untouchedAddress after nextIndex :>> ',
        nextIndex,
        untouchedAddressCandidate
      )
      used = untouchedAddressCandidate.used
      nextIndex = ++nextIndex
    }

    const document = {
      address: untouchedAddressCandidate.address,
      index: untouchedAddressCandidate.index,
    }

    // Publish new index doc
    await dispatch('submitDocument', {
      contract: 'PaymentRequest',
      typeLocator: 'AddressIndex',
      document,
    })

    return untouchedAddressCandidate
  },
  async initWallet({ state, commit }) {
    commit('clearClientError')
    commit('setClientWalletSynced', false)
    console.log('Initializing Dash.Client with mnemonic: ', state.mnemonic)
    client = new DashJS.Client({
      network: 'evonet',
      wallet: {
        mnemonic: state.mnemonic,
      },
      apps: {
        PaymentRequest: {
          contractId: 'BJazojioGy5GryCfgCNskD6crCEbfrP7YzEj7CydxKEi',
        },
      },
    })
    client.account = await client.wallet.getAccount()
    console.log('init finished >> wallet.getAccount():', client.account)
    commit('setClientWalletSynced', true)
  },
  async disconnectWallet() {
    console.log('Tearing down client.wallet..')
    await client.account.disconnet()
  },
  async searchDashNames({ dispatch }, searchString) {
    const queryOpts = {
      where: [
        ['normalizedParentDomainName', '==', 'dash'],
        ['normalizedLabel', 'startsWith', searchString.toLowerCase()],
      ],
      startAt: 0,
      limit: 20,
      orderBy: [['normalizedLabel', 'asc']],
    }
    try {
      const searchNames = await client.platform.documents.get(
        'dpns.domain',
        queryOpts
      )
      console.log({ searchNames })
      // commit('setSearchNames', searchNames)
      return searchNames
    } catch (e) {
      dispatch('showSnackbar', { text: e.message })
      console.error('Something went wrong:', e)
    }
  },
  // async cancelPaymentRequest({ dispatch }, requestDocument) {
  //   console.log('cancelling requestDocument :>> ', requestDocument)

  //   // We're using satoshis === 0 to detect a cancelled request
  //   requestDocument.satoshis = 0

  //   const document = await dispatch('requestPayment', requestDocument)

  //   console.log('cancelled document :>> ', document)
  // },
  async refundPaymentRequest(
    { commit, dispatch },
    { requestDocument, satoshis = undefined }
  ) {
    try {
      console.log('requestDocument :>> ', requestDocument)
      console.log('satoshis in refundPaymentRequest :>> ', satoshis)
      // Received Address: where the PaymentRequest received the funds we are about to send back
      const receivedAddress = requestDocument.encAddress

      // Get refund utxos, privateKeys and satoshis amount
      const [account, UTXO] = await Promise.all([
        client.wallet.getAccount(),
        dispatch('getUTXO', receivedAddress),
      ])

      const utxos = UTXO.items

      const privateKeys = await account.getPrivateKeys([receivedAddress])

      // If satoshis are not provided, give full refund
      if (satoshis === undefined) {
        satoshis = UTXO.items.reduce((acc: number, cur: any) => {
          return cur.satoshis + acc
        }, 0)
      }

      console.log('receivedAddress :>> ', receivedAddress)
      console.log('UTXO :>> ', UTXO)
      console.log('totalReceivedSat :>> ', satoshis)
      console.log('privateKeys :>> ', privateKeys)

      // Refund Address: Get the address where to send the refund
      const refundAddressDoc = await client.platform.documents.getById(
        'PaymentRequest.PaymentIntent',
        requestDocument.refId
      )
      console.log('refundAddressDocs :>> ', refundAddressDoc)
      const refundAddress = refundAddressDoc.data.encRefundAddress

      // Send refund tx
      console.log('balance', account.getTotalBalance())
      const transaction = account.createTransaction({
        recipient: refundAddress,
        satoshis,
        utxos,
        privateKeys,
        deductFee: true,
        change: receivedAddress,
      })

      console.log('transaction :>> ', transaction)
      const result = await account.broadcastTransaction(transaction)

      console.log('Transaction broadcast!\nTransaction ID:', result)

      commit('showSnackbar', {
        text: 'Payment sent\n' + result,
        color: 'green',
      })
      // dispatch('refreshWallet')
    } catch (e) {
      commit('showSnackbar', {
        text: e.message,
      })
      throw e
    }
  },
  async submitDocument(
    { commit, dispatch, state },
    { contract, typeLocator, document }
  ) {
    await dispatch('isAccountReady')
    const { identityId } = state

    console.log(
      `Submitting document to ${contract}.${typeLocator} using identityId ${identityId}:`,
      document
    )

    const { platform } = client

    try {
      const identity = await platform.identities.get(identityId)
      // const identity = await cachedOrGetIdentity(client, identityId)
      // console.log({ identity })

      const createdDocument = await platform.documents.create(
        `${contract}.${typeLocator}`,
        identity,
        document
      )
      console.log('Broadcasting created document:', { createdDocument })

      const documentBatch = {
        create: [createdDocument],
        replace: [],
        delete: [],
      }

      const result = await platform.documents.broadcast(documentBatch, identity)
      console.log('result :>> ', result)
    } catch (e) {
      commit('showSnackbar', { text: e.message })
      console.error('Something went wrong:', e)
    }
  },
  async requestFiat(
    { dispatch },
    {
      requesteeUserId,
      requesteeUserName,
      fiatAmount,
      fiatSymbol,
      memo = '',
      refId = '',
      address = undefined,
    }
  ) {
    console.log('memo :>> ', memo)
    console.log('fiatAmount :>> ', fiatAmount)
    // TODO proper error / timeout handling and rates caching using timestamps

    const satoshis = await dispatch('fiatToSatoshis', {
      fiatAmount,
      fiatSymbol,
    })
    const document = await dispatch('requestPayment', {
      requesteeUserId,
      requesteeUserName,
      satoshis,
      fiatAmount,
      fiatSymbol,
      memo,
      refId,
      address,
    })
    return document
  },
  async fiatToSatoshis({ commit }, { fiatAmount, fiatSymbol }) {
    console.log('fiatSymbol :>> ', fiatSymbol)
    try {
      const response = await this.$axios.get(
        'https://rates2.dashretail.org/rates?source=dashretail&symbol=dashusd'
      )

      const fiatConversionRate = parseFloat(response.data[0].price)
      console.log('fiatConversionRate :>> ', fiatConversionRate)

      const dashAmount = fiatAmount / fiatConversionRate
      console.log('dashAmount :>> ', dashAmount)

      const satoshis = Unit.fromBTC(dashAmount).toSatoshis()
      return satoshis
    } catch (e) {
      commit('showSnackbar', {
        text: 'Using static conversion rate, API unavailable',
      })
      // throw e
      console.error(e)
      const fiatConversionRate = 72
      console.log('static fiatConversionRate :>> ', fiatConversionRate)

      const dashAmount = fiatAmount / fiatConversionRate
      console.log('dashAmount :>> ', dashAmount)

      const satoshis = Unit.fromBTC(dashAmount).toSatoshis()
      return satoshis
    }
  },
  async requestPayment(
    { state, dispatch },
    {
      requesteeUserId,
      requesteeUserName,
      satoshis,
      memo = '',
      refId = '',
      fiatAmount = 0,
      fiatSymbol = '',
      address = undefined,
    }
  ) {
    await dispatch('isAccountReady')

    const requesterUserId = state.name.docId
    const requesterUserName = state.name.label
    // const userIdentity = await client.platform.identities.get($userIdentityId)
    // const recipientPublicKey = userIdentity.publicKeys[0].data

    // const senderPrivateKey = client.account
    //   .getIdentityHDKeyByIndex(0, 0)
    //   .privateKey.toString()

    if (address === undefined) {
      address = await dispatch('getUntouchedAddress')
      address = address.address
    }

    // const encAddress = encrypt(senderPrivateKey, address, recipientPublicKey)
    // const encSatoshis = encrypt(
    //   senderPrivateKey,
    //   satoshis.toString(),
    //   recipientPublicKey
    // )

    const document = {
      requesterUserId,
      requesterUserName,
      requesteeUserId,
      requesteeUserName,
      memo,
      refId,
      encAddress: address,
      encSatoshis: satoshis.toString(),
      encFiatAmount: fiatAmount.toString(),
      encFiatSymbol: fiatSymbol,
      timestamp: timestamp(),
    }

    await dispatch('submitDocument', {
      contract: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      document,
    })
    return document
  },
  async fetchPaymentRequests({ dispatch, state }) {
    // TODO cache & paginate using timestamp

    const queryOpts = {
      limit: 100,
      startAt: 1,
      orderBy: [
        ['timestamp', 'desc'],
        ['refId', 'asc'],
      ],
      where: [['requesterUserId', '==', state.name.docId]],
    }

    const paymentRequests = await dispatch('queryDocuments', {
      contract: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      queryOpts,
    })
    console.log('paymentRequests :>> ', paymentRequests)

    // No transactions, return early
    if (!paymentRequests) return []

    // TODO dedupe by refId

    const collatedRequests: any = {}
    for (const item of paymentRequests) {
      const doc = item.toJSON()
      const { refId } = doc

      console.log(doc.memo, doc.encFiatAmount, doc.refId)

      collatedRequests[refId] = collatedRequests[refId]
        ? [...collatedRequests[refId], doc]
        : [doc]
    }
    console.log(collatedRequests)

    const sortedRequests = []
    for (const refId in collatedRequests) {
      const docs = collatedRequests[refId]
      const lastTimestamp = docs[0].timestamp
      // const firstTimestamp = docs[docs.length - 1].timestamp

      sortedRequests.push({
        // firstTimestamp,
        lastTimestamp,
        countDocs: docs.length,
        docs,
      })
    }

    sortedRequests.sort(function (a, b) {
      return b.lastTimestamp - a.lastTimestamp
    })

    console.dir(sortedRequests)
    sortedRequests.forEach((doc) => console.log(doc))

    // Add transaction and status info
    const paymentRequestsWithUTXOs = await Promise.all(
      sortedRequests.map(async (pr: any) => {
        const utxos = await dispatch('getUTXO', pr.docs[0].encAddress)
        const summary = await dispatch(
          'getAddressSummary',
          pr.docs[0].encAddress
        )

        // console.log('Getting UTXO for :>> ', pr.encAddress, utxos)

        // Add the payment request status
        let status

        const requestedSatoshis = parseInt(pr.docs[0].encSatoshis)

        if (requestedSatoshis === 0 && summary.totalTxAppearances === 0) {
          status = 'Cancelled'
        } else if (
          requestedSatoshis === 0 &&
          summary.totalBalanceSat === 0 &&
          summary.totalTxAppearances > 1
        ) {
          status = 'Refunded'
        } else if (
          summary.totalBalanceSat === 0 &&
          summary.txAppearances === 0
        ) {
          status = 'Pending'
        }
        // TODO once deductFee is fixed, should be 0
        else if (Math.abs(requestedSatoshis - summary.totalBalanceSat) < 1000) {
          status = 'Paid'
          // if (summary.txAppearances > 1) status = 'Amended'
        } else if (summary.totalBalanceSat > requestedSatoshis) {
          status = 'Overpaid'
        } else if (summary.totalBalanceSat < requestedSatoshis) {
          status = 'Underpaid'
        }

        return {
          ...pr,
          summary,
          utxos,
          status,
        }
      })
    )
    console.log('paymentRequestsWithUTXOs :>> ', paymentRequestsWithUTXOs)
    return paymentRequestsWithUTXOs
  },
  async queryDocuments(
    { commit },
    {
      contract,
      typeLocator,
      queryOpts = {
        limit: 1,
        startAt: 1,
      },
    }
  ) {
    console.log(`Querying documents for ${contract}.${typeLocator} and `, {
      queryOpts,
    })
    // await this.dispatch('isAccountReady') // Causes infinite loop
    // commit('setSyncing', true)
    try {
      const documents = await client.platform.documents.get(
        `${contract}.${typeLocator}`,
        queryOpts
      )
      console.log('Query result:', { documents })
      return documents
    } catch (e) {
      commit('showSnackbar', { text: e, color: 'red' })
      console.error('Something went wrong:', e)
    } finally {
      // commit('setSyncing', false)
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUTXO({ state }, address: string) {
    const DAPIclient = client.getDAPIClient()
    console.log('DAPIclient :>> ', DAPIclient)
    const UTXO = await DAPIclient.core.getUTXO(address)
    return UTXO
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAddressSummary({ state }, address: string) {
    const DAPIclient = client.getDAPIClient()
    const summary = await DAPIclient.core.getAddressSummary(address)

    summary.totalBalanceSat = summary.balanceSat + summary.unconfirmedBalanceSat

    summary.totalTxAppearances =
      summary.txAppearances + summary.unconfirmedAppearances

    return summary
  },
}
