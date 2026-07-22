import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import StoreList from './pages/Stores/StoreList'
import StoreDetail from './pages/Stores/StoreDetail'
import StoreUpload from './pages/Stores/StoreUpload'
import StockList from './pages/Stocks/StockList'
import StockUpload from './pages/Stocks/StockUpload'
import StockDetail from './pages/Stocks/StockDetail'
import DeliveryUpload from './pages/Delivery/DeliveryUpload'
import DepoList from './pages/Depo/DepoList'
import DepoCreate from './pages/Depo/DepoCreate'
import DepoDetail from './pages/Depo/DepoDetail'
import DepoEdit from './pages/Depo/DepoEdit'
import UserList from './pages/Users/UserList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/stores/upload" element={<StoreUpload />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/stocks" element={<StockList />} />
          <Route path="/stocks/upload" element={<StockUpload />} />
          <Route path="/stocks/:storeId" element={<StockDetail />} />
          <Route path="/delivery" element={<DeliveryUpload />} />
          <Route path="/depo" element={<DepoList />} />
          <Route path="/depo/new" element={<DepoCreate />} />
          <Route path="/depo/:id" element={<DepoDetail />} />
          <Route path="/depo/:id/edit" element={<DepoEdit />} />
          <Route path="/users" element={<UserList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
