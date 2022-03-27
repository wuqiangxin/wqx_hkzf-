import React from "react"

import { Link } from 'react-router-dom'
import { Toast } from 'antd-mobile'

// 导入样式
// import './index.scss'
import styles from './index.module.css'

// 调用公共组件
// 导入 NavHeader 顶部导航栏
import NavHeader from '../../components/NavHeader'
import HouseItem from '../../components/HouseItem'
// import axios from "axios"
import { API } from '../../utils/api'

// 导入BASE_URL
import { BASE_URL } from '../../utils/url'

// 定义 全局的 BMapGL
const BMapGL = window.BMapGL

// 覆盖物样式
const labelStyle = {
    cursor: 'pointer',
    border: '0px solid rgb(255, 0, 0)',
    padding: '0px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    color: 'rgb(255, 255, 255)',
    textAlign: 'center'
}

export default class Map extends React.Component {

    state = {
        housesList: [],
        isShowList: false
    }
    componentDidMount() {

        this.initMap()
    }

    // 初始化地图
    initMap() {
        const { label, value } = JSON.parse(localStorage.getItem('hkzf_city'))
        // console.log(label, value, '当前定位')

        // 通过new操作符可以创建一个地图实例。其参数可以是元素id也可以是元素对象。
        const map = new BMapGL.Map("container");

        // 方便在别的方法中 获取到 map 来使用
        this.map = map

        //创建地址解析器实例
        const myGeo = new BMapGL.Geocoder();
        // 将地址解析结果显示在地图上，并调整地图视野
        myGeo.getPoint(label, async point => {
            if (point) {
                map.centerAndZoom(point, 11);
                // 当前 所在的 点 （小红点）
                // map.addOverlay(new BMapGL.Marker(point, { title: label }))

                // 添加 比例尺 和 平移控件
                const scaleCtrl = new BMapGL.ScaleControl();  // 添加比例尺控件
                map.addControl(scaleCtrl);
                const zoomCtrl = new BMapGL.ZoomControl();  // 添加缩放控件
                map.addControl(zoomCtrl);

                // 获取 renderOverlays 数据信息
                this.renderOverlays(value)

                // // 获取房源信息
                // const res = await axios.get(`http://localhost:8080/area/map?id=${value}`)
                // // console.log(res, '城市房屋数据')

                // // 给 每一个房屋数据添加信息
                // res.data.body.forEach(item => {

                //     const { coord: { longitude, latitude }, label: areaName, count, value } = item
                //     // offSet 偏移

                //     const areaPoint = new BMapGL.Point(longitude, latitude)
                //     const opts = {
                //         position: areaPoint,
                //         offset: new BMapGL.Size(-35, -35)
                //     }

                //     // 创建文本覆盖物
                //     // 添加 setContent 后 第一个参数会失效， 所以清空第一个参数，但不能删除第一个参数
                //     const label = new BMapGL.Label('', opts)

                //     // 给 覆盖物添加 id 唯一标识
                //     label.id = value

                //     // 添加房屋 覆盖物
                //     label.setContent(`
                //     <div class="${styles.bubble}">
                //         <p class="${styles.name}">${areaName}</p>
                //         <p>${count}套</p>
                //     </div>
                // `)

                //     // 设置样式
                //     label.setStyle(labelStyle)

                //     // 给覆盖物添加事件
                //     label.addEventListener('click', () => {
                //         console.log('触发点击事件', label.id)

                //         // 放大地图 放大当前 覆盖物的房屋信息
                //         // 第一个参数为 坐标
                //         // 第二个参数 是 放大级别
                //         map.centerAndZoom(areaPoint, 13)

                //         // 清除 当前覆盖物信息  为了 渲染下一级的房屋信息（所以要清除当前的房屋信息数据）
                //         map.clearOverlays()
                //     })

                //     // 将 覆盖物 展示到地图上
                //     map.addOverlay(label);
                // })
            } else {
                alert('您选择的地址没有解析到结果！');
            }
        }, label)

        // Point类描述了一个地理坐标点，其中116.404表示经度，39.915表示纬度。（为天安门坐标）
        // const point = new BMapGL.Point(116.404, 39.915);

        // 地图初始化，同时设置地图展示级别
        // map.centerAndZoom(point, 15);

        // 给地图绑定移动事件
        map.addEventListener('movestart', () => {
            // console.log('movestart')
            if (this.state.isShowList) {
                this.setState({
                    isShowList: false
                })
            }
        })
    }

    // 渲染覆盖物入口
    // 1 接收区域 id 参数，获取该区域下的房源数据
    // 2 获取房源类型以及下级地图缩放级别
    async renderOverlays(id) {
        try {
            // 开启loading
            Toast.loading('加载中...', 0, null, false)
            // 获取该区域下的房源数据
            const res = await API.get(`/area/map?id=${id}`)
            //    console.log('renderOverlays 获取的数据', res)
            // 关闭 loading
            Toast.hide()

            const data = res.data.body

            // 调用 getTypeAndZoom 的方法
            const { nextZoom, type } = this.getTypeAndZoom()

            data.forEach(item => {

                // 创建 覆盖物
                this.createOverlays(item, nextZoom, type)
            })
        } catch (e) {
            // 关闭 loading
            Toast.hide()
        }

    }

    // 计算要绘制的覆盖物类型和下一个缩放级别
    // 区   -> 11 ，范围：>=10 <12
    // 镇   -> 13 ，范围：>=12 <14
    // 小区 -> 15 ，范围：>=14 <16
    getTypeAndZoom() {
        // 调用地图的 getZoom() 方法，来获取当前缩放级别
        const zoom = this.map.getZoom()
        let nextZoom, type

        // console.log('当前地图缩放的级别', zoom)
        if (zoom >= 10 && zoom < 12) {
            // 区
            // 镇的缩放区域比例
            nextZoom = 13
            // 形状
            type = 'circle'
        } else if (zoom >= 12 && zoom < 14) {
            // 镇
            nextZoom = 15
            type = 'circle'
        } else if (zoom >= 14 && zoom < 16) {
            // 小区
            type = 'rect'
        }

        return {
            nextZoom,
            type
        }
    }

    // 创建覆盖物
    createOverlays(data, zoom, type) {
        const { coord: { longitude, latitude }, label: areaName, count, value } = data

        const areaPoint = new BMapGL.Point(longitude, latitude)

        if (type === 'circle') {
            // 创建区、镇
            this.createCircle(areaPoint, areaName, count, value, zoom)
        } else {
            // 创建小区
            this.createRect(areaPoint, areaName, count, value)
        }
    }

    // 创建区、镇覆盖物
    createCircle(point, name, count, id, zoom) {
        // 创建区、镇 圆形覆盖物
        const label = new BMapGL.Label('', {
            position: point,
            offset: new BMapGL.Size(-50, -28)
        })

        // 给 覆盖物添加 id 唯一标识
        label.id = id

        // 添加房屋 覆盖物
        label.setContent(`
                    <div class="${styles.bubble}">
                        <p class="${styles.name}">${name}</p>
                        <p>${count}套</p>
                    </div>
                `)

        // 设置样式
        label.setStyle(labelStyle)

        // 给覆盖物添加事件
        label.addEventListener('click', () => {

            // 调用 renderOverlays 函数
            this.renderOverlays(id)

            // 放大地图 放大当前 覆盖物的房屋信息
            // 第一个参数为 坐标
            // 第二个参数 是 放大级别
            this.map.centerAndZoom(point, zoom)

            // 清除 当前覆盖物信息  为了 渲染下一级的房屋信息（所以要清除当前的房屋信息数据）
            this.map.clearOverlays()
        })

        // 将 覆盖物 展示到地图上
        this.map.addOverlay(label);
    }

    // 创建小区覆盖物
    createRect(point, name, count, id) {
        // 创建小区文本覆盖物
        const label = new BMapGL.Label('', {
            position: point,
            offset: new BMapGL.Size(-50, -28)
        })

        // 给 覆盖物添加 id 唯一标识
        label.id = id

        // 添加房屋 覆盖物
        label.setContent(`
            <div class="${styles.rect}">
                <span class="${styles.housename}">${name}</span>
                <span class="${styles.housenum}">${count}套</span>
                <i class="${styles.arrow}"></i>
            </div>
            `)

        // 设置样式
        label.setStyle(labelStyle)

        // 给覆盖物添加事件
        label.addEventListener('click', () => {

            // 获取房屋信息
            this.getHousesList(id)
        })

        // 将 覆盖物 展示到地图上
        this.map.addOverlay(label);
    }

    // 获取小区房源数据
    async getHousesList(id) {
        try {
            // 开启loading
            Toast.loading('加载中...', 0, null, false)

            const res = await API.get(`/houses?cityId=${id}`)

            // 关闭 loading
            Toast.hide()

            // console.log('房屋信息', res)
            this.setState({
                housesList: res.data.body.list,
                // 默认 不显示
                isShowList: true
            })
        } catch (e) {
            // 关闭 loading
            Toast.hide()
        }

    }

    // 封装渲染房屋列表的方法
    renderHousesList() {
        return this.state.housesList.map(item => (
          <HouseItem
            onClick={() => this.props.history.push(`/detail/${item.houseCode}`)}
            key={item.houseCode}
            src={BASE_URL + item.houseImg}
            title={item.title}
            desc={item.desc}
            tags={item.tags}
            price={item.price}
          />
        ))

        // return this.state.housesList.map(item => (
        //     <div className={styles.house} key={item.houseCode}>
        //         <div className={styles.imgWrap}>
        //             <img className={styles.img} src={BASE_URL + item.houseImg} alt="" />
        //         </div>
        //         <div className={styles.content}>
        //             <h3 className={styles.title}>{item.title}</h3>
        //             <div className={styles.desc}>{item.desc}</div>
        //             <div>
        //                 {/* ['近地铁', '随时看房'] */}
        //                 {item.tags.map((tag, index) => {
        //                     const tagClass = 'tag' + (index + 1)
        //                     return (
        //                         <span
        //                             className={[styles.tag, styles[tagClass]].join(' ')}
        //                             key={tag}
        //                         >
        //                             {tag}
        //                         </span>
        //                     )
        //                 })}
        //             </div>
        //             <div className={styles.price}>
        //                 <span className={styles.priceNum}>{item.price}</span> 元/月
        //             </div>
        //         </div>
        //     </div>
        // ))
    }

    render() {
        return (
            <div className={styles.map}>
                {/* 头部导航栏 */}
                {/* 1. 传入自定义的 函数 */}
                {/* <NavHeader onLeftClick={() => {console.log('打印输出')}}>
                    地图找房
                </NavHeader> */}
                {/* 2. 执行默认的 函数 */}
                <NavHeader>
                    地图找房
                </NavHeader>

                {/* 地图区域 */}
                <div id="container" className={styles.container} />

                {/* 房源列表 */}
                {/* 添加 styles.show 展示房屋列表 */}
                <div
                    className={[
                        styles.houseList,
                        this.state.isShowList ? styles.show : ''
                    ].join(' ')}
                >
                    <div className={styles.titleWrap}>
                        <h1 className={styles.listTitle}>房屋列表</h1>
                        <Link className={styles.titleMore} to="/home/list">
                            更多房源
                        </Link>
                    </div>

                    <div className={styles.houseItems}>
                        {/* 房屋结构 */}
                        {this.renderHousesList()}
                    </div>
                </div>
            </div>
        )
    }
}