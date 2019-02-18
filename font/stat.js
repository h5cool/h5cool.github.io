/******************
 * @file stat.js
 * @desc 打点统计代码
 * @author leinov
 * @date:2019-02-15
 ******************/

! function (win) {
    // Stat构造函数
    function Stat() {
        this.valueStack = []; // 两个值入栈比较
        this.tagName = ""; // 目标元素的标签名
        this.fromSelect = ["INPUT", "SELECT", "RADIO", "CHECKBOX"]; // form类元素
        this.postData = {}; // 向后端发送请求的数据包
        this.inputValue = this.inputValue.bind(this);
        this.currentTagInfo = {}; // 当前点击元素的基本信息
        this.clickStack = []; //两次点击入栈比较
    }

    // Stat原型方法
    Stat.prototype = {
        // 初始化
        init: function () {
            var self = this;
            // 鼠标按下
            eventUtil.addEvent({
                type: "mousedown",
                cb: function (event) {
                    self.currentTagInfo["mouseDownTarget"] = event.target;
                    self.currentTagInfo["mouseDownTime"] = +new Date();
                }
            })
            // 鼠标抬起
            eventUtil.addEvent({
                type: "mouseup",
                cb: function (event) {
                    if (event.button === 2) {
                        return;
                    }
                    try {
                        self.currentTagInfo["mouseUptarget"] = event.target;
                        self.currentTagInfo["mouseUpTime"] = +new Date();
                        var sign = self.findNode(event.target, [], true),
                            pos = event.pageX + "," + event.pageY;

                        if (sign) {
                            var currentClickData = self.deepCopy(self.currentTagInfo), //判断两次事件
                                tagName = event.target.tagName, // 目标元素标签
                                isFormEle = self.fromSelect.some((item) => { // 是否为表单元素
                                    return item == tagName;
                                })

                            if (isFormEle) { // 被点击的是表单元素 分离便于维护和插拔
                                self.getFormEleValue(event.target);
                            } else { // 被点击的是普通元素
                                let clickOp = self.clickStackOp(currentClickData);
                                if (!clickOp) {
                                    console.log("本次点击无效");
                                    return;
                                }
                            }
                            self.postData = Object.assign({
                                sign,
                                pos,
                                tagName
                            }, {
                                sendType: 0
                            });
                            self.req();
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            })
        },

        /***
         * 点击事件优化
         * 
         * 在同一元素上当前点击和上次点击之间的时间差小于1000毫秒则本次点击无效
         * 当前点击的元素跟上次点击的元素不同但点击时间差小于1000毫秒则有效 
         * 
         * @param [Object] option 当前点击的
         * @returns [Boolean] true/false
         */
        clickStackOp: function (option) {
            if (option.mouseDownTarget !== option.mouseUptarget) {
                console.log("鼠标移出目标元素，点击无效");
                return false;
            }
            if (this.clickStack.length == 0) {
                this.clickStack.push(option);
                return true;
            } else if (this.clickStack.length == 1) {
                this.clickStack.push(option);
            } else {
                this.clickStack.shift();
                this.clickStack.push(option);
            }
            return this.clickStack[0].mouseUptarget === this.clickStack[1].mouseUptarget && this.clickStack[1].mouseDownTime - this.clickStack[0].mouseUpTime < 1000 ? false : true
        },

        /**
         * DOM遍历寻找标识
         * 
         * @param {HTMLObjectElement} node 
         * @param {String} ele 
         */
        findNode: function (node, sign, handle) {
            if (node != document.body) {
                var attr = node.getAttribute("ek-sign"),
                    box = node.getAttribute("ek-box");
                if ((sign.length === 0 && handle && box) || (sign.length === 0 && !attr)) {
                    return null;
                }
                attr = attr || box || "";
                sign.push(attr);
                return this.findNode(node.parentNode, sign);
            }
            return sign.filter((item) => {
                return item;
            }).reverse().join("-");
        },

        /**
         * 判断两次值是否一样，若一样阻止
         * 用于input，select选值
         * 
         * @param {String} value 
         * @returns {String || Null} value
         */
        checkOnce: function (value) {
            if (this.valueStack.length < 1) {
                this.valueStack.push(value);
                return value;
            } else if (this.valueStack.length == 1) {
                if (this.valueStack[0] === value) {
                    return null;
                }
                this.valueStack.push(value);
                return value;
            } else {
                this.valueStack.shift();
                this.valueStack.push(value);
                if (this.valueStack[0] === this.valueStack[1]) {
                    return null;
                } else {
                    return value;
                }
            }
        },

        // 获取input的值
        inputValue: function (event) {
            var value = event.target.value ? event.target.value : null,
                onceVule = this.checkOnce(value);
            if (onceVule) {
                this.postData = Object.assign(this.postData, {
                    value: onceVule
                })
                this.req();
            }
        },

        // 获取select选值
        selectValue: function (target) {
            let index = target.selectedIndex,
                value = target.options[index].value,
                text = target.options[index].text;
            this.postData = Object.assign(this.postData, {
                value: value ? value : text
            });
            var onceVule = this.checkOnce(value);
            if (onceVule) {
                this.req();
            }
        },

        // 获取表单值
        getFormEleValue: function (target) {
            switch (target.tagName) {
                case "SELECT":
                    this.selectValue(target);
                    break;
                case "INPUT":
                    target.addEventListener("blur", this.inputValue);
                    break;
                default:
                    break;
            }
        },

        // 主动发送
        sendData: function (event, sign, data) {
            try {
                if (!sign) {
                    return;
                }
                sign = this.findNode(event.target, [sign], false);
                this.postData = Object.assign({
                    sendType: 1,
                    sign: sign,
                    pos: event.pageX + "," + event.pageY,
                    tagName: event.target.tagName
                }, data)
                this.req();
            } catch (err) {
                console.log(err);
            }

        },

        // 向后端发送请求
        req: function () {
            let isTrue = this.fromSelect.some((item) => {
                return (this.postData.value == null && item == this.postData.tagName)
            })
            if (!isTrue) {
                console.info("向后端发送的数据")
                console.table(this.postData);
                console.trace(this);
            }
        },

        // 深拷贝
        deepCopy: function (data) {
            if (Object.prototype.toString.call(data) === "[object Array]") {
                return data.map(((item) => {
                    if (Object.prototype.toString.call(item) === "[object Array]" || Object.prototype.toString.call(item) === "[object Object]") {
                        return this.deepCopy(item);
                    }
                    return item;
                }));
            } else if (Object.prototype.toString.call(data) === "[object Object]") {
                let newData = {};
                for (let i in data) {
                    if (Object.prototype.toString.call(data[i]) === "[object Array]" || Object.prototype.toString.call(data[i]) === "[object Object]") {
                        newData[i] = this.deepCopy(data[i]);
                    } else {
                        newData[i] = data[i];
                    }
                }
                return newData;
            }
        }
    }

    var stat = new Stat();
    stat.init();
    if (win.stat === undefined) {
        win.stat = stat;
    }
}(window);