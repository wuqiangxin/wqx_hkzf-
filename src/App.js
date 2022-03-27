import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import cityList from './pages/cityList/index';
import Home from './pages/Home/index';

// 登录
import Login from './pages/Login'
import Registe from './pages/Registe'

// 导入地图组件
import Map from './pages/Map/index'

// 导入 房屋详情页面
import HouseDetail from './pages/HouseDetail';

// 房源发布
import Rent from './pages/Rent'
import RentAdd from './pages/Rent/Add'
import RentSearch from './pages/Rent/Search'

// 导入鉴权路由
import AuthRoute from './components/AuthRoute'

function App() {
  return (
    <Router>
      <div className="App">
        {/* 默认路由匹配时，跳转到 /home 实现路由重定向到首页 */}
        <Route exact path='/' render={() => <Redirect to='/home' />} />

        {/* 配置路由 */}
        <Route path='/home' component={Home}></Route>
        <Route path='/cityList' component={cityList}></Route>
        {/* 地图路由 */}
        <Route path='/map' component={Map}></Route>

        {/* AuthRoute 需要登录后才能访问的页面 */}
        {/* <AuthRoute path='/map' component={Map}></AuthRoute> */}

        {/* 房屋详情页 */}
        <Route path='/detail/:id' component={HouseDetail}></Route>

        {/* 登录 */}
        <Route path="/login" component={Login} />
        <Route path="/Registe" component={Registe} />
        {/* 配置登录后，才能访问的页面 */}
        <AuthRoute exact path="/rent" component={Rent} />
        <AuthRoute path="/rent/add" component={RentAdd} />
        <AuthRoute path="/rent/search" component={RentSearch} />
        
      </div>
    </Router>
  );
}

export default App;
