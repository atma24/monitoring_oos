import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import StoreList from './pages/Stores/StoreList'
import StoreDetail from './pages/Stores/StoreDetail'
import StockList from './pages/Stocks/StockList'
import StockUpload from './pages/Stocks/StockUpload'
import StockDetail from './pages/Stocks/StockDetail'
import DeliveryUpload from './pages/Delivery/DeliveryUpload'
import DepotList from './pages/Depots/DepotList'
import DepotCreate from './pages/Depots/DepotCreate'
import DepotDetail from './pages/Depots/DepotDetail'
import DepotEdit from './pages/Depots/DepotEdit'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/stocks" element={<StockList />} />
          <Route path="/stocks/upload" element={<StockUpload />} />
          <Route path="/stocks/:storeId" element={<StockDetail />} />
          <Route path="/delivery" element={<DeliveryUpload />} />
          <Route path="/depots" element={<DepotList />} />
          <Route path="/depots/new" element={<DepotCreate />} />
          <Route path="/depots/:id" element={<DepotDetail />} />
          <Route path="/depots/:id/edit" element={<DepotEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
