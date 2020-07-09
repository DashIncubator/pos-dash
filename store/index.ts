import { GetterTree, ActionTree, MutationTree } from 'vuex'
import dashcore from '@dashevo/dashcore-lib'

// import { encrypt, decrypt } from 'dash-secure-message'
// const { Address, Unit } = dashcore;
const { Unit } = dashcore

// AliceBuysDonuts
// panic wine useful travel purse dentist increase twenty aerobic anxiety milk glide
const DashJS = require('dash')

const timestamp = () => Math.floor(Date.now() / 1000)
let client: any

const getInitState = (): any => ({
  mnemonic:
    'grow lady mule dizzy resource allow mother civil tunnel patient hazard cushion',
  identityId: 'B34j8pPUinnYbyWC6YAaL7viGexGmcbQdJ5SvPKqiH2Q',
  name: {
    label: 'DashDonuts',
    docId: '7cgbnAfPS8ySvTrNJgy64AWsJdwkXESk8CspfCBm7uyN',
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
    state.pos.prevDocument = { ...POSOpts.prevDocument }
  },
  resetPOSOptions: (state) => {
    // state.pos.currency =
    state.pos.requesteeUserId = ''
    state.pos.requesteeUserName = ''
    state.pos.refId = ''
    state.pos.fiatAmount = 0
    state.pos.mode = 'newSale'
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
    let untouchedAddress = client.account.getUnusedAddress()
    console.log('untouchedAddress :>> ', untouchedAddress)

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

    console.log('getUntouchedAddress results :>> ', results)
    const prevIndex = results[0]?.data.index || 0

    const nextIndex = Math.max(prevIndex + 1, untouchedAddress.index)
    console.log('nextIndex :>> ', nextIndex)

    // Get final untouchedAddress based on nextIndex comparison with latest doc
    untouchedAddress = client.account.getAddress(nextIndex)
    console.log('untouchedAddress after nextIndex :>> ', untouchedAddress)

    const document = {
      address: untouchedAddress.address,
      index: untouchedAddress.index,
    }

    // Publish new index doc
    await dispatch('submitDocument', {
      contract: 'PaymentRequest',
      typeLocator: 'AddressIndex',
      document,
    })

    return untouchedAddress
  },
  async initWallet({ state, commit }) {
    commit('clearClientError')
    commit('setClientWalletSynced', false)
    console.log('Initializing Dash.Client with mnemonic: ', state.mnemonic)
    client = new DashJS.Client({
      wallet: {
        mnemonic: state.mnemonic,
      },
      apps: {
        PaymentRequest: {
          contractId: 'GV7wcCaJDoWr58k4EqukgoGfqB1pjupnk5R51dqraePs',
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
  async cancelPaymentRequest({ dispatch }, requestDocument) {
    console.log('cancelling requestDocument :>> ', requestDocument)

    // We're using satoshis === 0 to detect a cancelled request
    requestDocument.satoshis = 0

    const document = await dispatch('requestPayment', requestDocument)

    console.log('cancelled document :>> ', document)
  },
  async refundPaymentRequest(
    { commit, dispatch },
    { requestDocument, satoshis = undefined }
  ) {
    try {
      console.log('satoshis in refundPaymentRequest :>> ', satoshis)
      // Received Address: where the PaymentRequest received the funds we are about to send back
      const receivedAddress = requestDocument.data.encAddress

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
        requestDocument.data.refId
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
      commit('showSnackbar', { text: e.message })
      throw e
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
  async fetchPaymentRequests({ dispatch }) {
    // TODO cache & paginate using timestamp

    const queryOpts = {
      limit: 30,
      startAt: 1,
      orderBy: [
        ['timestamp', 'desc'],
        ['refId', 'asc'],
      ],
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

    // TODO add status information

    const DAPIclient = await client.getDAPIClient()

    const paymentRequestsWithUTXOs = await Promise.all(
      paymentRequests.map(async (pr: any) => {
        const utxos = await DAPIclient.getUTXO(pr.data.encAddress)
        const summary = await DAPIclient.getAddressSummary(pr.data.encAddress)
        // console.log('Getting UTXO for :>> ', pr.data.encAddress, utxos)
        return {
          ...pr,
          summary,
          utxos,
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
    // console.log(`Querying documents for ${contract}.${typeLocator} and `, {
    // queryOpts,
    // })
    // await this.dispatch('isAccountReady') // Causes infinite loop
    // commit('setSyncing', true)
    try {
      const documents = await client.platform.documents.get(
        `${contract}.${typeLocator}`,
        queryOpts
      )
      // console.log('Query result:', { documents })
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
    const DAPIclient = await client.getDAPIClient()
    const UTXO = await DAPIclient.getUTXO(address)
    return UTXO
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAddressSummary({ state }, address: string) {
    const DAPIclient = await client.getDAPIClient()
    const summary = await DAPIclient.getAddressSummary(address)
    return summary
  },
}
