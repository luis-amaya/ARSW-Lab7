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
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return new Point(
            Math.round(evt.clientX - rect.left),
            Math.round(evt.clientY - rect.top)
        );
    };

    var addPolygonToCanvas = function (puntos) {
        var canvas = document.getElementById("canvas");
        var c2 = canvas.getContext("2d");
        c2.clearRect(0, 0, canvas.Width, canvas.height);
        c2.beginPath();
        c2.moveTo(puntos[0].x, puntos[0].y);
        puntos.map(function (prue) {
            c2.lineTo(prue.x, prue.y);
        });
        c2.closePath();
        c2.fill();
    }

    var connectAndSubscribe = function () {
        if ($("#number").val() != "") numberConnection = $("#number").val();
        console.log(numberConnection);
        if (numberConnection != null) {
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function frame() {
                console.log('Connected: ' + frame);
                stompClient.subscribe(`/topic/newpoint.${numberConnection}`, function (eventbody) {
                    var thePoint = JSON.parse(eventbody.body);
                    addPointToCanvas(thePoint);
                    console.log(thePoint);
                });

                stompClient.subscribe(`/topic/newpolygon.${numberConnection}`, function (eventbody) {
                    var points = JSON.parse(eventbody.body);
                    addPolygonToCanvas(points);
                });
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

                stompClient.send(`/app/newpoint.${numberConnection}`, {}, JSON.stringify(pt));
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