window.onload = function () {

    function FontLoad() {
        this.Arr = [
            "kaiti", "youyuan", "lvshu", "liugongquan", "huawenxingkai", "fzzdhjt", "hwxw", "fangzhengqingke"
        ];

        this.loadFont(this.Arr[0]);
        //this.allLoad();
    }
    FontLoad.prototype = {
        query: function (node) {
            return document.querySelector(node);
        },

        // 遍历一个个加载字体
        loadFont: function (font) {
            var self = this;
            if (this.Arr.length < 1) {
                console.log("所有字体加载完成");
                return;
            }
            // 基础比较
            var hasBase = this.query("#font-base");
            if (!hasBase) {
                var base = document.createElement("span");
                base.setAttribute("id", "font-base")
                base.innerHTML = "作$页~帮&";
                document.getElementsByTagName('body')[0].appendChild(base);
            }

            // 获取基础比较文字的宽高度
            var baseWidth = this.query("#font-base").offsetWidth,
                baseHeight = this.query("#font-base").offsetHeight;

            // 设置插入节点
            var fontEle = document.createElement("span");
            fontEle.innerHTML = "作$页~帮&";
            fontEle.style.color = "red";
            fontEle.classList = font;
            this.query('body').appendChild(fontEle);

            // 检查比较宽度
            var check = setInterval(() => {
                let fontEleWidth = self.query("." + font).offsetWidth,
                    fontEleHeight = self.query("." + font).offsetHeight;
                console.log(baseWidth, baseHeight, fontEleWidth, fontEleHeight);
                if (baseWidth != fontEleWidth || baseHeight != fontEleHeight) {

                    clearInterval(check);
                    self.Arr.shift();
                    let nextFont = self.Arr[0];
                    return self.loadFont(nextFont);
                }
            }, 50)
        },
        // 一次性加载完
        allLoad: function () {
            var wrapEle = document.createElement("p");
            wrapEle.setAttribute("id", "ff-hi-load");
            for (let i = 0, len = this.Arr.length; i < len; i++) {
                var fontEle = document.createElement("span");
                fontEle.innerHTML = "正";
                fontEle.style.color = "red";
                fontEle.classList = this.Arr[i];
                wrapEle.appendChild(fontEle);
                this.query('body').appendChild(wrapEle);
            }
        }

    }
    document.addEventListener('error', function () {
        console.log("error");
    })
    var font = new FontLoad();
    window.font = font;

}