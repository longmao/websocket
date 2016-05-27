var util = {
    localStor: {
        setItem: function(id, item) {
            if (window.localStorage) {
                localStorage.setItem(id, item)
            } else {
                $.cookie(id, item)
            }
        },
        getItem: function(item) {
            if (window.localStorage) {
                return localStorage.getItem(item)
            } else {
                return $.cookie(item)
            }
        }
    },
    browserSize: {
        width: window.innerWidth || document.body.clientWidth,
        height: window.innerHeight || document.body.clientHeight
    },
    splitIntoMultiParts: function(clickCount) {
        var base_num = parseInt((clickCount / this.INTERVAL_TIMES).toFixed())
        var last_num = clickCount - base_num*(this.INTERVAL_TIMES - 1)
        var arr = [];
        for (var i = 0 ; i < this.INTERVAL_TIMES; i++) {
            if(i){
                arr.push(base_num)
            }else{
                arr.push(last_num)
            }
        }
        return arr
    },
    INTERVAL_TIMES:9
}
