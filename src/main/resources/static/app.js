var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    var numberConnection = null;
    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return new Point(
            Math.round(evt.clientX - rect.left),
            Math.round(evt.clientY - rect.top)
        );
    };


    var connectAndSubscribe = function () {
        if ($("#number").val() != "") numberConnection = $("#number").val();
        console.log(numberConnection);
        if (numberConnection != null) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function frame() {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.${numberConnection}', function (eventbody) {
                    var thePoint = JSON.parse(eventbody.body);
                    addPointToCanvas(thePoint);
                    console.log(thePoint);
                })
            })
        } else {
            alert("Inserte Primero un numero");
        }

    };


    var init = function () {
        //connectAndSubscribe();
        var canvas = document.getElementById("canvas");
        if (window.PointerEvent) {
            canvas.addEventListener("pointerdown", _addPoint);
        } else {
            canvas.addEventListener("mousedown", function (event) {
                canvas.addEventListener("pointerdown", _addPoint);
            })
        }
    }

    function _addPoint(event) {
        var canvas = document.getElementById("canvas");
        var offset = _getOffset(canvas);
        app.publishPoint(event.pageX - offset.left, event.pageY - offset.top);
    }

    function _getOffset(obj) {
        var offsetLeft = 0;
        var offsetTop = 0;
        do {
            if (!isNaN(obj.offsetLeft)) {
                offsetLeft += obj.offsetLeft
            }
            if (!isNaN(obj.offsetTop)) {
                offsetTop += obj.offsetTop;
            }
        } while (obj = obj.offsetParent);
        return {
            left: offsetLeft,
            top: offsetTop
        };
    }

    return {

        init: init,
        connect: connectAndSubscribe,
        publishPoint: function (px, py) {
            if (numberConnection != null) {
                var pt = new Point(px, py);
                console.info("publishing point at " + pt);
                addPointToCanvas(pt);

                stompClient.send('/topic/newpoint.${numberConnection}', {}, JSON.stringify(pt));
            } else {
                alert("Establezca una conexion");
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();