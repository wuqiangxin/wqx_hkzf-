import React from "react"
import { Flex, Toast } from 'antd-mobile'

// 导入 styles 样式
import styles from './index.module.css'

// 导入 SearchHeader 组件
import SearchHeader from '../../components/SearchHeader'
import HouseItem from '../../components/HouseItem'

import { BASE_URL } from '../../utils/url'

import Filter from './components/Filter'

import { API } from '../../utils/api'
import {getCurrentCity} from '../../utils'

// 导入吸顶功能
import Sticky from '../../components/Sticky'
import NoHouse from '../../components/NoHouse'

// 导入 list 城市列表渲染组件
import { List, AutoSizer, WindowScroller, InfiniteLoader } from 'react-virtualized';

// 获取当前城市定位信息
// const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))

export default class HouseList extends React.Component {

    state = {
        // 房屋列表数据
        list: [],
        // 总条数
        count: 0,
        // 数据加载的状态
        isLoading: false
    }
    // 初始化一个 数据，防止 未定义 报错
    filters = {}
    label = ''
    value = ''

    async componentDidMount() {
        const {label, value} = await getCurrentCity()
        this.label = label
        this.value = value

        this.searchHouseList()
    }

    // 渲染房屋列表项
    renderHouseList = ({ key, index, style }) => {
        // 根据索引号来获取当前这一行的房屋数据
        const { list } = this.state
        const house = list[index]

        // 如果不存在，就渲染 loading 元素占位
        if (!house) {
            return (
                <div key={key} style={style}>
                    <p className={styles.loading} />
                </div>
            )
        }

        return (
            <HouseItem
                key={key}
                onClick={() => this.props.history.push(`/detail/${house.houseCode}`)}
                // 注意：该组件中应该接收 style，然后给组件元素设置样式！！！
                style={style}
                src={BASE_URL + house.houseImg}
                title={house.title}
                desc={house.desc}
                tags={house.tags}
                price={house.price}
            />
        )
    }

    // 获取 房屋数据
    async searchHouseList() {
        // 获取 城市信息
        // const { value } = JSON.parse(localStorage.getItem('hkzf_city'))

        // 数据要开始加载了
        this.setState({
            isLoading: true
        })
        // 开启loading
        Toast.loading('加载中...', 0, null, false)
        // 发送获取数据的请求
        const res = await API.get('/houses', {
            params: {
                cityId: this.value,
                ...this.filters,
                start: 1,
                end: 20
            }
        })

        const { list, count } = res.data.body

        // 关闭loading
        Toast.hide()

        if (count !== 0) {
            Toast.info(`共找到 ${count} 套房源`, 2, null, false)
        }
        // 更新 state 的状态
        this.setState({
            list,
            count,
            // 数据加载完成来了
            isLoading: false
        })

        // console.log('房屋信息：', list, count)
    }

    // 获取 选择栏中的参数
    onFilter = (filters) => {
        // 获取数据后都返回页面顶部
        window.scrollTo(0, 0)
        this.filters = filters

        // console.log(this.filters)
        // 调用 获取房屋信息的函数
        this.searchHouseList()
    }

    // 判断每一行数据是否 加载完成
    isRowLoaded = ({ index }) => {
        return !!this.state.list[index];
    }

    // 用来获取更多房屋信息
    // 注意：该方法的返回值是一个 Promise 对象，并且，这个对象应该在数据加载完成时，来调用 resolve 让Promise对象的状态变为已完成。
    loadMoreRows = ({ startIndex, stopIndex }) => {
        // return fetch(`path/to/api?startIndex=${startIndex}&stopIndex=${stopIndex}`)
        //   .then(response => {
        //     // Store response data in list...
        //   })
        // console.log(startIndex, stopIndex)

        return new Promise(resolve => {
            API.get('/houses', {
                params: {
                    cityId: this.value,
                    ...this.filters,
                    start: startIndex,
                    end: stopIndex
                }
            }).then(res => {
                this.setState({
                    list: [...this.state.list, ...res.data.body.list]
                })
            })

            // 直接 调用 resolve 即可
            resolve()
        })
    }

    // 渲染列表数据
    renderList() {
        const { count, isLoading } = this.state
        // 关键点：在数据加载完成后，再进行 count 的判断
        // 解决方式：如果数据加载中，则不展示 NoHouse 组件；而，但数据加载完成后，再展示 NoHouse 组件
        if (count === 0 && !isLoading) {
            return <NoHouse>没有找到房源，请您换个搜索条件吧~</NoHouse>
        }

        return (
            <InfiniteLoader
                isRowLoaded={this.isRowLoaded}
                loadMoreRows={this.loadMoreRows}
                rowCount={count}
            >
                {({ onRowsRendered, registerChild }) => (
                    <WindowScroller>
                        {({ height, isScrolling, scrollTop }) => (
                            <AutoSizer>
                                {({ width }) => (
                                    <List
                                        onRowsRendered={onRowsRendered}
                                        ref={registerChild}
                                        autoHeight // 设置高度为 
                                        // WindowScroller 最终渲染的列表高度
                                        width={width}  // 视口的宽度
                                        height={height} // 视口的高度
                                        rowCount={count}  // List列表项的行数
                                        rowHeight={120} // 每一行的高度
                                        rowRenderer={this.renderHouseList} // 渲染列表项中的每一行
                                        isScrolling={isScrolling}
                                        scrollTop={scrollTop}
                                    />
                                )}
                            </AutoSizer>
                        )}
                    </WindowScroller>
                )}
            </InfiniteLoader>
        )
    }

    render() {
        return (
            <div>
                {/* 头部区域 */}
                <Flex className={styles.header}>
                    <i className="iconfont icon-back"
                        onClick={() => { this.props.history.go(-1) }}></i>
                    {/* 搜索框 */}
                    <SearchHeader cityName={this.label} className={styles.searchHeader} />
                </Flex>

                {/* 选择区域 */}
                <Sticky height={40}>
                    <Filter onFilter={this.onFilter} />
                </Sticky>

                {/* 房屋列表 */}
                <div className={styles.houseItems}>
                    {this.renderList()}
                </div>
            </div>

        )
    }
}