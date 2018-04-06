const five = require("johnny-five");
const request = require('request');
const board = new five.Board({
    port: "COM4"
});

var entrar = 0;
var saida = 0;

//var ObstaculoEntrada = false;
//var ObstaculoSaida = false;

var final;
const configuracao = require("./modulo-api");
const id = configuracao.id;
const api = configuracao.api;
const UpdateSensor = api + "/api/Sensor/" + id;

board.on("ready", function () {

    var ledSucesso = new five.Led(9); // verde
    var ledCarregando = new five.Led(10); // amarelo
    var ledErro = new five.Led(8); // vermelho
    var apiStatus = {
        sucesso: "sucesso",
        erro: "erro",
        carregando: "carregando"  
    }

    function reportaStatus(status){
        ledCarregando.stop();
        ledCarregando.off();
        ledSucesso.off();
        ledErro.off();

        switch (status) {
            case apiStatus.erro:
                ledErro.on();
                break;
            case apiStatus.sucesso:
                ledSucesso.on();
                break;
            case apiStatus.carregando:
                ledCarregando.blink();
                break;
            default:
                break;
        }
    }
    function tratarResposta (error, res, body) {
        if (error || res.statusCode != 200) {
            console.error(error || res.statusCode);
            reportaStatus(apiStatus.erro);
            return;
        }
        reportaStatus(apiStatus.sucesso);
        console.log(res.statusCode);
    }

    var BotaoEntrada = new five.Button(6);
    var BotaoSaida = new five.Button(7);

    BotaoEntrada.on("down", function () {
        //var ObstaculoEntrando = BotaoEntrada("up");

        //if (ObstaculoEntrada && !ObstaculoEntrando) {
            entrar++;
        //}

        //ObstaculoEntrada = ObstaculoEntrando;

        console.log("Número de pessoas que entraram :");
        console.log(entrar);

        reportaStatus(apiStatus.carregando);
        request.put(UpdateSensor + "/entrada_saida", {
            json: true,
            body: {
                "acao": 0 // 0 = Entrada
            }
        }, tratarResposta);
    });

    BotaoSaida.on("up", function () {
        //var ObstaculoSaindo = BotaoSaida("up");

        //if (ObstaculoSaida && !ObstaculoSaindo) {
            saida++;
       // }

        //ObstaculoSaida = ObstaculoSaindo;
        console.log("Número de pessoas que sairam: ");
        console.log(saida);

        reportaStatus(apiStatus.carregando);
        request.put(UpdateSensor + "/entrada_saida", {
            json: true,
            body: {
                "acao": 1 // 1 = Saída
            }
        }, tratarResposta);
    });

    // setInterval(function () {
    //     final = (entrar - saida);
    //     if (final <= 0) {
    //         saida = 0;
    //         entrar = 0;
    //     }
    //     console.log("Número de pessoas que estão no busão: ");
    //     console.log(final);
    //     const dados = {
    //         valor: final
    //     };

    //     console.log(UpdateSensor + "/total");
    //     reportaStatus(apiStatus.carregando);
    //     request.put(UpdateSensor + "/total", {
    //         json: true,
    //         body: dados
    //     }, tratarResposta);
    // }, 5000);
});