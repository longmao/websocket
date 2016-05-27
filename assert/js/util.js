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
    splitIntoFiveParts: function(clickCount) {
        var base_num = parseInt((clickCount / 5).toFixed())
        var last_num = clickCount - base_num*4
        return [base_num , base_num, base_num, base_num, last_num]
    },
    INTERVAL_TIMES:5
}
