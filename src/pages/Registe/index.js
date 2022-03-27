import React, { Component } from 'react'
import { Flex, WingBlank, WhiteSpace, Toast } from 'antd-mobile'

import { Link } from 'react-router-dom'

// 导入withFormik
import { withFormik, Form, Field, ErrorMessage } from 'formik'

// 导入Yup
import * as Yup from 'yup'

// 导入 API
import { API } from '../../utils'

import NavHeader from '../../components/NavHeader'

import styles from './index.module.css'


// 验证规则：
const REG_UNAME = /^[a-zA-Z_\d]{5,8}$/
const REG_PWD = /^[a-zA-Z_\d]{3,12}$/

/* 
  简化表单处理：

  1 导入 Form 组件，替换 form 元素，去掉 onSubmit。
  2 导入 Field 组件，替换 input 表单元素，去掉 onChange、onBlur、value。
  3 导入 ErrorMessage 组件，原来的错误消息逻辑代码。
  4 去掉所有 props。
*/

class Registe extends Component {

  render() {
    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader}>注册</NavHeader>
        <WhiteSpace size="xl" />

        {/* 注册表单栏 */}
        <WingBlank>
          <Form>
            {/* 账号 */}
            <div className={styles.formItem}>
              <label className={styles.label}>用户名</label>

              {/* 将 input 替换为 Field */}
              <Field
                className={styles.input}
                name="username"
                placeholder="请输入账号"
              />
            </div>

            <ErrorMessage
              className={styles.error}
              name="username"
              component="div"
            />

            {/* 密码 */}
            <div className={styles.formItem}>
              <label className={styles.label}>密码</label>

              <Field
                className={styles.input}
                name="password"
                type="password"
                placeholder="请输入密码"
              />
            </div>
            <ErrorMessage
              className={styles.error}
              name="password"
              component="div"
            />

            {/* 重置密码 */}
            <div className={styles.formItem}>
              <label className={styles.label}>重复密码</label>

              <Field
                className={styles.input}
                name="password1"
                type="password"
                placeholder="请确定您的密码"
              />
            </div>
            <ErrorMessage
              className={styles.error}
              name="password1"
              component="div"
            />

            {/* 注册 */}
            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">
                注册
              </button>
            </div>
          </Form>

          {/* 注册页面的 链接 */}
          <Flex className={styles.backHome} justify="between">
            <Link to="/home">点我回首页</Link>
            <Link to="/login">已有账号，去登录</Link>
          </Flex>
        </WingBlank>
      </div>
    )
  }
}

Registe = withFormik({
  // 提供状态：
  mapPropsToValues: () => ({ username: '', password: '', password1: '' }),

  // 添加表单校验规则
  validationSchema: Yup.object().shape({
    username: Yup.string()
      .required('账号为必填项')
      .matches(REG_UNAME, '长度为5到8位，只能出现数字、字母、下划线'),
    password: Yup.string()
      .required('密码为必填项')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下划线'),
    password1: Yup.string()
      .required('密码为必填项')
      .matches(REG_PWD, '长度为5到12位，只能出现数字、字母、下划线')
  }),

  // 表单的提交事件
  handleSubmit: async (values, { props }) => {
    // 获取账号和密码
    const { username, password, password1 } = values

    // console.log('表单提交了', username, password)

    if (password !== password1) {

      Toast.info('量词输入的面不一致', 2, null, false)

      return
    }

    // 发送请求
    const res = await API.post('/user/registered', {
      username,
      password,
    })

    const { status, body, description } = res.data

    if (status === 200) {
      // 登录成功
      localStorage.setItem('hkzf_token', body.token)

      Toast.info('注册成功', 2, null, false)

      //  跳转到 登录页面
      props.history.push('/login')
    } else {
      // 注册失败
      Toast.info(description, 2, null, false)
    }
  }
})(Registe)

export default Registe
