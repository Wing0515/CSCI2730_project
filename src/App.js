import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import CUHKon from './abis/Cuhkon.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [cuhkon, setCuhkon] = useState(null)

  const [account, setAccount] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)
  const [cuhk, setCuhk] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }
 
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const cuhkon = new ethers.Contract(address, CUHKon, provider)
    setCuhkon(cuhkon)

    const items = []

    for (var i = 0; i < 14; i++) {
      const item = await cuhkon.items(i + 1)
      items.push(item)
    }

    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')
    const cuhk = items.filter((item) => item.category === 'cuhk')

    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)
    setCuhk(cuhk)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>CUHKon Best Sellers</h2>

      {electronics && clothing && toys && cuhk && (
        <>
          <Section title={"CUHK Merchandise"} items={cuhk} togglePop={togglePop} />
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} cuhkon={cuhkon} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
