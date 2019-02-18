var dom = {
    getByClass: function (el) {
        return document.getElementsByClassName(el);
    },
    getById:function(id){
        return document.getElementById(id)
    },
    query:function(node){
        return document.querySelector(node);
    }
}