function updateClickCount(clickCount) {
    var clickCount = parseInt(util.localStor.getItem("clickCount")) || 0;
    $(".countArea").html(clickCount)
}

function updateTime() {
    $("#time").html(moment().format('HH:mm:ss <br> MMMM DD YYYY'))
}

function refreshClickCountViewHandler(fivePartsArr, index) {
    var clickCount = parseInt(util.localStor.getItem("clickCount") || 0);


    clickCount += fivePartsArr[index]
    console.log("currentIndex:" + index)
    console.log("clickCount:" + clickCount)
    util.localStor.setItem("clickCount", clickCount)
    updateClickCount(clickCount)
}

function createWebSocket(offId, affId, clientIp, columnType) {
    var     url = 0 ? 'ws://172.30.30.231:8379' : 'ws://52.20.23.23:8379'
    if (offId == window.offerId && affId == window.affiliateId && clientIp == window.clientIp && window.columnType == columnType) {
        return;
    } else {
        destoryWebSocket();
    }
    var clientId = 'yeahping' + (location.hash ? "_" + location.hash.substr(1) : "_a"); //保证唯一性
    var webSocket = new WebSocketClient(url, "yeahping", clientId);


    webSocket.onMessageListener(function(msg) {
        console.log(msg)
        diff(function() {
            var temp = 0;
            var obj = JSON.parse(msg);
            var index = 0;
            _.map(obj, function(v, k) {
                temp += v
            })
            var fivePartsArr = util.splitIntoMultiParts(temp)
            console.info(fivePartsArr)
            window.updateClickCount_interval = setInterval(function() {
                if (index === util.INTERVAL_TIMES -1 ) {
                    index = 0
                    console.log("loop end")
                    clearInterval(window.updateClickCount_interval);
                    return
                } else {
                    index++;
                    refreshClickCountViewHandler(fivePartsArr, index)
                }

            }, 3000)
            refreshClickCountViewHandler(fivePartsArr, index)


        })


    })
}

function destoryWebSocket() {
    window.websocket = null;
}

function getStartTime() {
    var time = util.localStor.getItem("startTime");;
    if (!time) {
        setStartTime()
        return Date.now()
    } else {
        return parseInt(time)
    }

}

function setMapImageWidthAndHeight() {
    var $map = $("#map img")
    $map.width(util.browserSize.width);
    $map.height(util.browserSize.height);
}

function setStartTime() {
    var currentTime = Date.now()
    firstStartUpTime = currentTime
    util.localStor.setItem("startTime", currentTime)
}

function diff(callback) {
    var startTime = getStartTime()
    moment_a = moment(startTime)
    moment_b = moment(Date.now())
    if (parseInt(moment_b.format("D")) !== parseInt(moment_a.format("D"))) {
        console.log("new days:" + moment_b.days())
        setStartTime()
        util.localStor.setItem("clickCount", 0)
        updateClickCount()
    } else {
        callback && callback()
    }

}
