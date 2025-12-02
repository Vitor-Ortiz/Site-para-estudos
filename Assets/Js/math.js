/* assets/js/math.js - Lógica Matemática */

// 1. BASES
function converterBases(origem) {
    const decInput = document.getElementById('input-dec');
    const binInput = document.getElementById('input-bin');
    const hexInput = document.getElementById('input-hex');
    let valor = 0;

    if (origem === 'dec') valor = parseInt(decInput.value, 10);
    else if (origem === 'bin') valor = parseInt(binInput.value, 2);
    else if (origem === 'hex') valor = parseInt(hexInput.value, 16);

    if (isNaN(valor)) {
        if(origem !== 'dec') decInput.value = "";
        if(origem !== 'bin') binInput.value = "";
        if(origem !== 'hex') hexInput.value = "";
        return;
    }

    if(origem !== 'dec') decInput.value = valor;
    if(origem !== 'bin') binInput.value = valor.toString(2);
    if(origem !== 'hex') hexInput.value = valor.toString(16).toUpperCase();
}

// 2. REGRA DE 3
function calcRegra3() {
    const a = parseFloat(document.getElementById('r3-a').value);
    const b = parseFloat(document.getElementById('r3-b').value);
    const c = parseFloat(document.getElementById('r3-c').value);
    const res = document.getElementById('r3-result');

    if (a && b && c) {
        const result = (b * c) / a;
        res.innerText = Number.isInteger(result) ? result : result.toFixed(2);
    } else {
        res.innerText = "X";
    }
}

// 3. PX <-> REM (NOVO)
function calcPxRem(origem) {
    const pxInput = document.getElementById('input-px');
    const remInput = document.getElementById('input-rem');
    const base = 16; // Padrão web

    if (origem === 'px') {
        const px = parseFloat(pxInput.value);
        if(!isNaN(px)) remInput.value = (px / base).toFixed(3).replace(/\.000$/, '');
        else remInput.value = '';
    } else {
        const rem = parseFloat(remInput.value);
        if(!isNaN(rem)) pxInput.value = (rem * base).toFixed(0);
        else pxInput.value = '';
    }
}

// 4. LÓGICA BOOLEANA
let currentLogicAnswer = false;
function gerarDesafioLogico() {
    const ops = ['&&', '||', '!==', '==='];
    const vals = [true, false];
    const v1 = vals[Math.floor(Math.random()*2)];
    const v2 = vals[Math.floor(Math.random()*2)];
    const op = ops[Math.floor(Math.random()*4)];
    
    let expr = `${v1} ${op} ${v2}`;
    let res;
    
    switch(op) {
        case '&&': res = v1 && v2; break;
        case '||': res = v1 || v2; break;
        case '!==': res = v1 !== v2; break;
        case '===': res = v1 === v2; break;
    }
    
    if (Math.random() > 0.7) { expr = `!(${expr})`; res = !res; }

    currentLogicAnswer = res;
    document.getElementById('logic-expr').innerText = expr;
    document.getElementById('logic-feedback').innerHTML = '';
}

function checkLogic(resp) {
    const fb = document.getElementById('logic-feedback');
    if (resp === currentLogicAnswer) {
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        if(window.adicionarXP) window.adicionarXP(15);
        fb.innerHTML = '<span style="color:#4ade80;font-weight:bold">CORRETO! +15 XP</span>';
        setTimeout(gerarDesafioLogico, 1000);
    } else {
        if(window.playSoundGlobal) window.playSoundGlobal('error');
        fb.innerHTML = '<span style="color:#ef4444;font-weight:bold">ERRADO!</span>';
    }
}

document.addEventListener('DOMContentLoaded', gerarDesafioLogico);