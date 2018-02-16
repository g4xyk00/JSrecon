//Modified from http://webkay.robinlinus.com/scripts/network-scanner.js

window.networkScanner = (function() {

    function scan(ipPrefix, i, callback, finishedCallback) {
        var intID_ws;
        var start_time_ws = Date.now();
        var closetimeout = 1200;
        var opentimeout = 2500;
        var process_port_ws = false;

        function websocket_scan(hostname) {

            if ("WebSocket" in window) {
                ws_scan = new WebSocket("ws://" + hostname);
            }
            if ("MozWebSocket" in window) {
                ws_scan = new MozWebSocket("ws://" + hostname);
            }

            //var interval = (new Date).getTime() - start_time_ws;

            intID_ws = setInterval(
                function() {
                    var interval = Date.now() - start_time_ws;

                    if (process_port_ws) {
                        clearInterval(intID_ws);
                        return;
                    }
                    if (ws_scan.readyState === 3) // CLOSE
                    {
                        clearInterval(intID_ws);
                        process_port_ws = true;
                        if (interval < closetimeout) {
                            done(false);
                        } else {
                            done(true);
                        }
                    }

                    if (interval >= opentimeout) {
                        clearInterval(intID_ws);
                        process_port_ws = true;

                        done(false);
                    }
                    return;
                }, 1);
        }




        function done(alive) {
            if (ws_scan) {
                ws_scan.close();
                ws_scan = undefined;
            }
            // clearInterval(intID_ws);
            callback(ipPrefix + i, alive, i)
            if (i < 254) {
                scan(ipPrefix, i + 1, callback, finishedCallback);
            } else {
                if (finishedCallback) {
                    finishedCallback();
                }
            }
        }

        websocket_scan(ipPrefix + i);
    }

    return {
        scan: function(ipPrefix, callback, finishedCallback) {
            scan(ipPrefix, 1, callback, finishedCallback);
        }
    }
}())

function scanMyNetwork(myIp) {
    var regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\./;
    var subnet = myIp.match(regex)[0];

    var elem = document.getElementById('networkscan');
    var progress = document.getElementById('progress');;

    //wait 5s before we start, so there's less noise in the background
    setTimeout(function() {
        networkScanner.scan(subnet, function(ip, alive, i) {
            progress.innerHTML = '<small>Scanning ' + subnet + (i + 1) + '</small>';

            if (alive) {
                elem.innerHTML += ('<br><a target="_blank" href="http://' + ip + '/"><span class="glyphicon glyphicon-ok-circle"></span> ' + ip + '</a>')
            }
        }, function() {
            progress.style.display = 'none';
        }, 5000);
    })
}
