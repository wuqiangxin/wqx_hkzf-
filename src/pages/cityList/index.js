import React from "react";
import { Toast } from 'antd-mobile';

// 导入 NavHeader 组件
import NavHeader from '../../components/NavHeader'

import './index.scss'

import axios from "axios";

// 导入 list 城市列表渲染组件
import { List, AutoSizer } from 'react-virtualized';

// 获取当前城市的方法
import { getCurrentCity } from '../../utils'

// 格式化数据
const formatCityData = (list) => {

    const cityList = {}
    // const cityIndex = []

    // 1. 给城市数据排序，按照 abcd 的顺序来排序
    list.forEach(item => {

        // 获取 到 拼音首字母
        const first = item.short.substr(0, 1)

        // console.log(first) 
        // 条件满足 直接 push 到数组中
        if (cityList[first]) {

            cityList[first].push(item)
        } else {
            // 否者 创建一个新的数组。在新数组中添加数据
            cityList[first] = [item]
        }
    });

    // 2. 获取 到 key 值  并且是有序排列
    const cityIndex = Object.keys(cityList).sort()

    return {
        cityList,
        cityIndex
    }
}

// 城市列表 数据源  Array(100).fill('react-virtualied')  表示创建100个字符串
// const list = Array(100).fill('react-virtualied')

// list 渲染城市列表 方法
// function rowRenderer({
//     key, // Unique key within array of rows
//     index, // Index of row within collection
//     isScrolling, // The List is currently being scrolled
//     isVisible, // This row is visible within the List (eg it is not an overscanned row)
//     style, // Style object to be applied to row (to position it)
// }) {
//     return (
//         <div key={key} style={style}>
//             1233- {list[index]} {index} {isScrolling + ''}
//         </div>
//     );
// }

const formatCityIndex = (letter) => {
    switch (letter) {
        case "#":
            return '当前城市'

        case "hot":
            return '热门城市'

        default:
            return letter.toUpperCase()
    }
}

// 索引（A、B等）的高度
const TITLE_HEIGHT = 36
// 每个城市名称的高度
const NAME_HEIGHT = 50

// 有房源的城市
const HOUSE_CITY = ['北京', '上海', '广州', '深圳']

export default class cityList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            cityList: {},
            cityIndex: [],
            // 右侧字母索引号高亮
            activeIndex: 0
        }

        this.cityListComponent = React.createRef()
    }



    async componentDidMount() {
        await this.getCityList()

        // 调用 measureAllRows，提前计算 List 中每一行的高度，实现 scrollToRow 的精确跳转
        // 调用 measureAllRows 方法时要确定 已经获取到了 list 数据，否者会报错
        this.cityListComponent.current.measureAllRows()
    }

    // 获取城市列表数据
    async getCityList() {
        const res = await axios.get('http://localhost:8080/area/city?level=1')

        const { cityList, cityIndex } = formatCityData(res.data.body)

        // 获取热门城市数据
        const hotRes = await axios.get('http://localhost:8080/area/hot')
        // console.log('热门城市', hotRes)

        // 给 城市列表 添加 热门城市
        cityList['hot'] = hotRes.data.body

        // 给 索引号添加 hot 热门城市字符
        cityIndex.unshift('hot')

        // 获取当前定位城市
        const curCity = await getCurrentCity()

        // 将当前城市数据 添加到 cityList 中
        cityList['#'] = [curCity]
        cityIndex.unshift('#')

        // console.log(cityList, cityIndex, curCity)
        this.setState({
            cityList,
            cityIndex
        })
    }

    // 切换城市
    changeCity({ label, value }) {
        if (HOUSE_CITY.indexOf(label) > -1) {
            // 有
            localStorage.setItem('hkzf_city', JSON.stringify({ label, value }))
            this.props.history.go(-1)
        } else {
            Toast.info('该城市暂无房源数据', 1, null, false)
        }
    }

    // list 渲染城市列表 方法
    rowRenderer = ({
        key, // Unique key within array of rows
        index, // Index of row within collection
        isScrolling, // The List is currently being scrolled
        isVisible, // This row is visible within the List (eg it is not an overscanned row)
        style, // Style object to be applied to row (to position it)
    }) => {
        // 获取 城市列表 索引  这里的 this 指向是 未定义的 需要改变this指向
        const { cityIndex, cityList } = this.state
        const letter = cityIndex[index]

        // 获取 渲染城市列表数据 （城市名称）
        // console.log(cityList[letter])

        return (
            <div key={key} style={style} className="city">
                <div className="title">{formatCityIndex(letter)}</div>
                {
                    cityList[letter].map(item => (<div className="name" key={item.value} onClick={() => this.changeCity(item)}>{item.label}</div>))
                }
            </div>
        );
    }

    // 创建动态计算每一行高度的方法
    getRowHeight = ({ index }) => {
        // console.log(index)
        // 索引标题高度 + 城市数量 * 城市名称的高度
        // TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
        const { cityList, cityIndex } = this.state

        return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
    }

    // 封装渲染右侧索引列表的方法
    renderCityIndex() {
        // 获取到 cityIndex，并遍历其，实现渲染
        const { cityIndex, activeIndex } = this.state

        return cityIndex.map((item, index) =>
            <li className="city-index-item" key={item} onClick={() => {
                // console.log('当前索引', index) 
                // 调用 scrollToRow 滚动函数  List 中自带的函数
                this.cityListComponent.current.scrollToRow(index)

            }}>
                <span className={activeIndex === index ? "index-active" : ''}>{item === 'hot' ? '热' : item.toUpperCase()}</span>
            </li>
        )
    }

    // 用于获取List组件中渲染行的信息
    onRowsRendered = ({ startIndex }) => {
        // console.log('startIndex', startIndex)

        if (this.state.activeIndex !== startIndex) {
            this.setState({
                activeIndex: startIndex
            })
        }

    }

    render() {
        return (
            <div className="citylist">
                {/* 首部 dom 元素 */}
                <NavHeader
                >城市选择</NavHeader>

                {/* 城市列表 */}
                <AutoSizer>
                    {
                        ({ width, height }) => <List
                            ref={this.cityListComponent}
                            width={width}
                            height={height}
                            rowCount={this.state.cityIndex.length}
                            rowHeight={this.getRowHeight}
                            rowRenderer={this.rowRenderer}
                            onRowsRendered={this.onRowsRendered}
                            scrollToAlignment="start"
                        />
                    }
                </AutoSizer>

                {/* 右侧索引列表 */}
                <ul className="city-index">
                    {this.renderCityIndex()}
                </ul>

            </div>
        )
    }
}
