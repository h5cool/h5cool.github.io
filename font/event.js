/****************************
 * @name 事件封装
 * @desc 封装了常用的事件函数
 * @author leinov
 * @date 2019-02-15
 * @notice 区分ie和非ie事件
 ****************************/
var eventUtil = {
    /**
     * 添加事件
     * 
     * @param {HTMLObjectElement} ele 触发元素
     * @param {String} type  事件类型
     * @param {Function} cb 事件回调函数
     * @param {Bollean} capture 是否捕获阶段触发
     */
    addEvent: function ({
        ele = window,
        type = "click",
        cb = () => {},
        capture = false
    } = {}) {
        if (window.addEventListener) {
            ele.addEventListener(type, cb, capture)
        } else if (window.attachEvent) {
            ele['attachEvent']('on' + type, cb)
        } else {
            ele["on" + type] = cb;
        }
    },
    // 移除事件-参数与添加时间对应
    removeEvent: function ({
        ele = document,
        type = "click",
        cb = () => {},
        capture = false
    } = {}) {
        if (window.removeEventListener) {
            ele.removeEventListener(type, cb, capture)
        } else if (window.detachEvent) {
            ele['detachEvent']('on' + type, cb)
        } else {
            ele["on" + type] = null;
        }
    },
    // 获取触发的元素
    getTarget: function (e) {
        return e.target || event.serElement;
    },
    // 获取事件类型
    getType: function (e) {
        return e.type;
    },
    // 获取事件本身
    getEvent: function (e) {
        return e;
    },
    // 阻止冒泡
    stopBubble: function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBuble = false;
        }
    },
    // 阻止默认事件
    prevent: function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false
        }
    },
    // 右键行为
    rightKey: function () {
        this.addEvent({
            type: "contextmenu",
            cb: function (event) {
                event.preventDefault();
            }
        })
    },

}