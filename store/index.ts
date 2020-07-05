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
  },
  resetPOSOptions: (state) => {
    // state.pos.currency =
    state.pos.requesteeUserId = ''
    state.pos.requesteeUserName = ''
    state.pos.refId = ''
    state.pos.fiatAmount = 0
    state.pos.mode = 'newSale'
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
          contractId: '3Pd2SFbAqDF9G2RjcYmzbQuGEJ6xqF11ufEKpQEKNKxE',
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

    requestDocument.satoshis = 0

    const document = await dispatch('requestPayment', requestDocument)

    console.log('cancelled document :>> ', document)
  },
  async refundPaymentRequest({ commit, dispatch }, requestDocument) {
    try {
      // Get refund amount
      const receivedAddress = requestDocument.data.encAddress
      console.log('requestDocument :>> ', requestDocument)
      console.log('receivedAddress :>> ', receivedAddress)
      const UTXO = await dispatch('getUTXO', receivedAddress)
      const utxos = UTXO.items
      const totalReceivedSat = UTXO.items.reduce((acc: number, cur: any) => {
        return cur.satoshis + acc
      }, 0)
      console.log('UTXO :>> ', UTXO)
      console.log('totalReceivedSat :>> ', totalReceivedSat)

      // Get refund address
      const queryOpts = {
        limit: 1,
        startAt: 1,
        where: [['$id', '==', requestDocument.data.refId]],
      }
      const refundAddressDocs = await dispatch('queryDocuments', {
        contract: 'PaymentRequest',
        typeLocator: 'PaymentIntent',
        queryOpts,
      })
      console.log('refundAddressDocs :>> ', refundAddressDocs)
      const refundAddress = refundAddressDocs[0].data.encRefundAddress

      // Send refund tx
      const account = await client.wallet.getAccount()
      const privateKeys = await account.getPrivateKeys([receivedAddress])
      console.log('privateKeys :>> ', privateKeys)
      console.log('balance', account.getTotalBalance())
      const transaction = account.createTransaction({
        recipient: refundAddress,
        satoshis: totalReceivedSat,
        utxos,
        privateKeys,
        deductFee: true,
      })
      // const signedTx = account.sign(transaction)
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
    const response = await this.$axios.get(
      'https://rates2.dashretail.org/rates?source=dashretail&symbol=dashusd'
    )
    const fiatConversionRate = parseFloat(response.data[0].price)
    console.log('fiatConversionRate :>> ', fiatConversionRate)

    const dashAmount = fiatAmount / fiatConversionRate
    console.log('dashAmount :>> ', dashAmount)

    const satoshis = Unit.fromBTC(dashAmount).toSatoshis()
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

    const address = client.account.getUnusedAddress().address

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
      limit: 10,
      startAt: 1,
      orderBy: [['timestamp', 'desc']],
    }
    const transactions = await dispatch('queryDocuments', {
      contract: 'PaymentRequest',
      typeLocator: 'PaymentRequest',
      queryOpts,
    })
    console.log('transactions :>> ', transactions)

    // No transaction, return early
    if (!transactions) return []

    const DAPIclient = await client.getDAPIClient()
    console.log(
      'getutxo',
      await DAPIclient.getUTXO(transactions[0]?.data.encAddress)
    )
    const transactionsWithUTXOs = await Promise.all(
      transactions.map(async (tx: any) => {
        const utxos = await DAPIclient.getUTXO(tx.data.encAddress)
        return { ...tx, utxos }
      })
    )
    return transactionsWithUTXOs
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
