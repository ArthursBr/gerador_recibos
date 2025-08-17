document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('dataPagamento').valueAsDate = new Date();
});

function numeroParaTexto(numero) {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (numero === 0) return 'zero';
    if (numero === 100) return 'cem';

    let texto = '';
    
    if (numero >= 100) {
        const centena = Math.floor(numero / 100);
        texto += centenas[centena];
        numero %= 100;
        if (numero > 0) texto += ' e ';
    }

    if (numero >= 20) {
        const dezena = Math.floor(numero / 10);
        texto += dezenas[dezena];
        numero %= 10;
        if (numero > 0) texto += ' e ' + unidades[numero];
    } else if (numero >= 10) {
        texto += especiais[numero - 10];
    } else if (numero > 0) {
        texto += unidades[numero];
    }

    return texto;
}

function valorParaTexto(valor) {
    const [reais, centavos = '00'] = valor.toFixed(2).split('.');
    const reaisNum = parseInt(reais);
    const centavosNum = parseInt(centavos);

    let texto = '';

    if (reaisNum === 1) {
        texto += 'um real';
    } else if (reaisNum > 1) {
        if (reaisNum <= 999) {
            texto += numeroParaTexto(reaisNum) + ' reais';
        } else {
            texto += reaisNum.toLocaleString('pt-BR') + ' reais';
        }
    }

    if (centavosNum > 0) {
        if (reaisNum > 0) texto += ' e ';
        if (centavosNum === 1) {
            texto += 'um centavo';
        } else {
            texto += numeroParaTexto(centavosNum) + ' centavos';
        }
    }

    return texto || 'zero reais';
}

function formatarData(data) {
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function gerarRecibo() {
    const valor = parseFloat(document.getElementById('valor').value);
    const pagador = document.getElementById('pagador').value;
    const cpfCnpjPagador = document.getElementById('cpfCnpjPagador').value;
    const referenciaTexto = document.getElementById('referenciaTexto').value;
    const nomeEmissor = document.getElementById('nomeEmissor').value;
    const cpfCnpjEmissor = document.getElementById('cpfCnpjEmissor').value;
    const telefone = document.getElementById('telefone').value;
    const cidade = document.getElementById('cidade').value;
    const dataPagamento = document.getElementById('dataPagamento').value;
    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked').value;
    const referente = document.querySelector('input[name="referente"]:checked')?.value || '';
    const duasVias = document.getElementById('duasVias').checked;

    const valorExtenso = valorParaTexto(valor);
    const dataFormatada = formatarData(dataPagamento);
    const valorFormatado = `R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    let reciboContent = `
        <p>Recebi(emos) de <strong>${pagador}</strong>${cpfCnpjPagador ? `, portador(a) do CPF/CNPJ <strong>${cpfCnpjPagador}</strong>` : ''}, pelo valor de <strong>${valorExtenso}</strong>, referente ${referente} <strong>${referenciaTexto}</strong>.</p>
        
        <p>Para maior clareza, firmo(amos) o presente recibo, que comprova o recebimento integral do valor mencionado, concedendo <strong>quitação plena, geral e irrevogável</strong> pela quantia recebida.</p>
        
        <p><strong>Forma de pagamento:</strong> ${formaPagamento}</p>
    `;

    function criarReciboItem(viaNumero = null) {
        return `
            <div class="recibo-item">
                <div class="info-superior-esquerda">
                    ${viaNumero ? `<div class="via-label">${viaNumero} Via</div>` : ''}
                    ${telefone ? `<div class="telefone-superior">${telefone}</div>` : ''}
                </div>
                <div class="valor-box">${valorFormatado}</div>
                <h2>Recibo de Pagamento</h2>
                <div class="recibo-content">${reciboContent}</div>
                <div class="data-local">${cidade}, ${dataFormatada}</div>
                <div class="assinatura">
                    <div class="linha-assinatura"></div>
                    <div class="nome-assinatura">${nomeEmissor}${cpfCnpjEmissor ? ` - ${cpfCnpjEmissor}` : ''}</div>
                </div>
            </div>
        `;
    }

    let reciboHTML = '';
    
    if (duasVias) {
        reciboHTML = criarReciboItem('1ª') + criarReciboItem('2ª');
    } else {
        reciboHTML = criarReciboItem();
    }

    document.getElementById('reciboContainer').innerHTML = reciboHTML;
    
    document.getElementById('recibo').style.display = 'block';
    
    document.getElementById('recibo').scrollIntoView({ behavior: 'smooth' });
}

function limparFormulario() {
    document.getElementById('reciboForm').reset();
    document.getElementById('dataPagamento').valueAsDate = new Date();
    document.getElementById('recibo').style.display = 'none';
}

function imprimirRecibo() {
    const reciboContent = document.getElementById('recibo').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Recibo de Pagamento</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background: white;
                }
                .recibo-item {
                    background: white;
                    border: 3px solid #333;
                    border-radius: 15px;
                    padding: 40px;
                    position: relative;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                .recibo-item:last-of-type {
                    margin-bottom: 0;
                }
                h2 {
                    text-align: center;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: #333;
                }
                .valor-box {
                    position: absolute;
                    top: 20px;
                    right: 30px;
                    border: 2px solid #333;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-weight: bold;
                    font-size: 14px;
                }
                .info-superior-esquerda {
                    position: absolute;
                    top: 20px;
                    left: 30px;
                    font-size: 12px;
                    color: #333;
                }
                .via-label {
                    font-weight: bold;
                    color: #666;
                    margin-bottom: 5px;
                }
                .nome-superior {
                    font-weight: bold;
                    font-size: 13px;
                    margin-bottom: 2px;
                }
                .telefone-superior {
                    font-size: 11px;
                    color: #666;
                }
                .recibo-content {
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: justify;
                    margin-bottom: 40px;
                }
                .recibo-content p {
                    margin-bottom: 15px;
                }
                .data-local {
                    text-align: right;
                    margin: 30px 0;
                    font-size: 14px;
                }
                .assinatura {
                    margin-top: 50px;
                    text-align: center;
                }
                .linha-assinatura {
                    border-bottom: 2px solid #333;
                    width: 300px;
                    margin: 30px auto 10px;
                }
                .nome-assinatura {
                    font-size: 14px;
                    margin-top: 5px;
                }
                @page {
                    margin: 15mm;
                    size: A4;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${reciboContent.replace(/<div style="text-align: center; margin-top: 30px;">[\s\S]*?<\/div>/, '')}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

document.getElementById('reciboForm').addEventListener('submit', function(e) {
    e.preventDefault();
    gerarRecibo();
});

function formatarCpfCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    input.value = value;
}

document.getElementById('cpfCnpjPagador').addEventListener('input', function() {
    formatarCpfCnpj(this);
});

document.getElementById('cpfCnpjEmissor').addEventListener('input', function() {
    formatarCpfCnpj(this);
});

document.getElementById('telefone').addEventListener('input', function() {
    let value = this.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
    this.value = value;
});