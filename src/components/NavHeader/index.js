// 在 components 组件文件夹下封装 公共组件
import React from "react";

import { NavBar } from 'antd-mobile'

// 导入 withRouter 高阶组件
import { withRouter } from 'react-router-dom'

// 导入 props 校验的包
import PropTypes from 'prop-types'

// 导入 公共组件样式
// import './index.scss'
import styles from './index.module.css'

// 用解构赋值的方法来 获取参数
// 传入 onLeftClick 函数就执行 onLeftClick 中的代码 否者就执行 defaultHandler 函数
function NavHeader({ children, history, onLeftClick, className,
    rightContent }) {

    // 默认点击行为
    const defaultHandler = () => history.go(-1)

    return (
        < NavBar
            className={[styles.navbar, className || ''].join(' ')}
            mode="light"
            icon={< i className='iconfont icon-back' />}
            onLeftClick={onLeftClick || defaultHandler}
            rightContent={rightContent}
        > {children}</NavBar >
    )
}

// 添加props校验
NavHeader.propTypes = {
    children: PropTypes.string.isRequired,
    onLeftClick: PropTypes.func,
    className: PropTypes.string,
    rightContent: PropTypes.array
}

// withRouter(NavHeader) 函数的返回值也是一个组件
export default withRouter(NavHeader)
