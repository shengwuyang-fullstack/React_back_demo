import React from 'react'
// import { json } from '../utils/ajax'
import { notification, Avatar } from 'antd'
import { replaceImg } from 'src/utils/util'
import {apis} from 'src/request/apis.js'
import YSW_TOOLS from 'src/utils/Ysw_tools.js'

export const SET_ROUTE="SET_ROUTE"
export function setRoute(routeArr){
    return {
        type:SET_ROUTE,
        routeArr
    }
}
export const SET_MENUS="SET_MENUS"
export function setMenu(menus){
    return {
        type:SET_MENUS,
        menus
    }
}

// 虽然用户信息放在localStorage也可以全局使用，但是如果放在localStorage中，用户信息改变时页面不会实时更新
export const SET_USER = 'SET_USER'
export function setUser(user) {
    return {
        type: SET_USER,
        user
    }
}

//同步action 便利获取路由表
export  function getRoute(authStr,allRoute,allMenu){
    return function (dispatch){
            let endArr=[]
            let menuArr=[]
            for(let j=0;j<authStr.length;j++){
                endArr.push(YSW_TOOLS.getFirstRoutePath(authStr[j],allRoute))
                menuArr.push(YSW_TOOLS.getFirstRoutePath(authStr[j],allMenu))
              }
            console.log("shittt",endArr)
            endArr=endArr.filter((item,idx)=>{
                return Object.keys(item).length!=0
            })
            menuArr=menuArr.filter((item,idx)=>{
                return Object.keys(item).length!=0
            })
            console.log("menuuuuuuuuuu",menuArr)
            dispatch(setRoute(endArr))
            dispatch(setMenu(menuArr))
    }
}

//异步action，从后台获取用户信息
export function getUser(param) {
    return async function (dispatch) {
        let obj=await apis.System.getUserDetail(param).then((res)=>{
            console.log("userrrrrrrrr",res)
            return res.data
        })
        dispatch(setUser({...obj,username:obj.name,id:obj._id,avatar:obj.avatar} || {}))

    }
}

export const SET_WEBSOCKET = 'SET_WEBSOCKET'  //设置websocket对象
export function setWebsocket(websocket) {
    return {
        type: SET_WEBSOCKET,
        websocket
    }
}


export function initWebSocket(user) {    //初始化websocket对象
    return async function (dispatch) {
        const websocket = new WebSocket("ws://" + window.location.hostname + ":8081")
        //建立连接时触发
        websocket.onopen = function () {
            const data = {
                id: user.id,
                username: user.username,
                avatar: user.avatar
            }
            //当用户第一次建立websocket链接时，发送用户信息到后台，告诉它是谁建立的链接
            websocket.send(JSON.stringify(data))
        }
        //监听服务端的消息事件
        websocket.onmessage = function (event) {
            const data = JSON.parse(event.data)
            //在线人数变化的消息
            if (data.type === 0) {
                dispatch(setOnlinelist(data.msg.onlineList))
                data.msg.text && notification.info({
                    message: '提示',
                    description: data.msg.text
                })
            }
            //聊天的消息
            if (data.type === 1) {
                dispatch(addChat(data.msg))
                // notification.open({
                //     message: data.msg.username,
                //     description: <div style={{wordBreak:'break-all'}} dangerouslySetInnerHTML={{ __html: replaceImg(data.msg.content) }} />,
                //     icon: <Avatar src={data.msg.userAvatar} />
                // })
            }
            console.log(11, data)
        }
        dispatch(setWebsocket(websocket))
        dispatch(initChatList())
    }
}

export const SET_ONLINELIST = 'SET_ONLINELIST'   //设置在线列表
export function setOnlinelist(onlineList) {
    return {
        type: SET_ONLINELIST,
        onlineList
    }
}

//异步action，初始化聊天记录列表
export function initChatList() {
    return async function (dispatch) {
        let chat=await apis.Chat.get().then(
            res=>{
                return res.data
            }
        )
        console.log("chatttt",chat)
        dispatch(setChatList(chat.data||[]))
        // const res = await json.get('/chat/list')
        // dispatch(setChatList(res.data || []))
    }
}
//设置聊天历史记录
export const SET_CHATLIST = 'SET_CHATLIST'
export function setChatList(chatList) {
    return {
        type: SET_CHATLIST,
        chatList
    }
}
//消息记录添加
export const ADD_CHAT = 'ADD_CHAT'
export function addChat(chat) {
    return {
        type: ADD_CHAT,
        chat
    }
}