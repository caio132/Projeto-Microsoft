const five = require("johnny-five");
const request = require("request");
const board = new five.Board({
    port: "COM5"
});
var entrar = 0;
var saida = 0;
var tinhaObstaculo = false;
var tinhaobs = false;
var final;
const configuracao = require("./config");
const id = configuracao.id;
const api = configuracao.api;
const endpointUpdateSensor = api + "/api/Sensor/" + id;

board.on("ready", function () {
    var SensorEntrada = new five.Proximity({
        controller: "HCSR04",
        pin: 7,
        freq: 500
    })
    var SensorSaida = new five.Proximity({
        controller: "HCSR04",
        pin: 6,
        freq: 500
    })

    SensorEntrada.on("data", function () {
        // se tinhaObstaculo e agora não tem mais
        var temObstaculo = this.cm < 15;

        if (tinhaObstaculo && !temObstaculo) {
            entrar++;
        }

        tinhaObstaculo = temObstaculo;
    });
    SensorSaida.on("data", function () {

        var temobs = this.cm < 15;

        if (tinhaobs && !temobs) {
            saida++;
        }
        tinhaobs = temobs;

        final = (entrar - saida);
        if (final <= 0) {
            saida = 0;
            entrar = 0;


        }
        console.log("Número de pessoas:   ");
        console.log(final);
        const dados = {
            valor: final
        };
        request.put(endpointUpdateSensor, {
            json: true,
            body: dados
        }, function (error, res, body) {
            if (error) {
                console.error(error);
                return;
            }
            // erro é nulo, tudo ok
            console.log(res && res.statusCode);
            console.log(body);
        });
    });
});
