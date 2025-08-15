// Configurar data atual como padrão
document.getElementById('dataPagamento').valueAsDate = new Date();

// Função para converter número em texto
function numeroParaTexto(numero) {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (numero === 0) return 'zero';
    if (numero === 100) return 'cem';

    let texto = '';
    
    // Centenas
    if (numero >= 100) {
        const centena = Math.floor(numero / 100);
        texto += centenas[centena];
        numero %= 100;
        if (numero > 0) texto += ' e ';
    }

    // Dezenas e unidades
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
            // Para valores maiores, usar uma versão simplificada
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

    // Conteúdo do recibo
    let reciboContent = `
        <p>Recebi(emos) de <strong>${pagador}</strong>${cpfCnpjPagador ? `, portador(a) do CPF/CNPJ <strong>${cpfCnpjPagador}</strong>` : ''}, a importância de <strong>${valorExtenso}</strong>, referente ${referente} <strong>${referenciaTexto}</strong>.</p>
        
        <p>Para maior clareza, firmo(amos) o presente recibo, que comprova o recebimento integral do valor mencionado, concedendo <strong>quitação plena, geral e irrevogável</strong> pela quantia recebida.</p>
    `;

    if (formaPagamento !== 'Dinheiro') {
        reciboContent += `<p><strong>Forma de pagamento:</strong> ${formaPagamento}</p>`;
    }

    // Função para criar um recibo individual
    function criarReciboItem(viaNumero = null) {
        return `
            <div class="recibo-item">
                ${viaNumero ? `<div class="via-label">${viaNumero} Via</div>` : ''}
                <div class="valor-box">${valorFormatado}</div>
                <h2>Recibo de Pagamento</h2>
                <div class="recibo-content">${reciboContent}</div>
                <div class="data-local">${cidade}, ${dataFormatada}</div>
                <div class="assinatura">
                    <div class="linha-assinatura"></div>
                    <div class="nome-assinatura">${nomeEmissor}${cpfCnpjEmissor ? ` - ${cpfCnpjEmissor}` : ''}</div>
                    <div class="telefone-assinatura">${telefone || ''}</div>
                </div>
            </div>
        `;
    }

    // Gerar recibo(s)
    let reciboHTML = '';
    
    if (duasVias) {
        // Gerar duas vias
        reciboHTML = criarReciboItem('1ª') + criarReciboItem('2ª');
    } else {
        // Gerar uma via apenas
        reciboHTML = criarReciboItem();
    }

    document.getElementById('reciboContainer').innerHTML = reciboHTML;
    
    // Mostrar o recibo
    document.getElementById('recibo').style.display = 'block';
    
    // Scroll para o recibo
    document.getElementById('recibo').scrollIntoView({ behavior: 'smooth' });
}

function limparFormulario() {
    document.getElementById('reciboForm').reset();
    document.getElementById('dataPagamento').valueAsDate = new Date();
    document.getElementById('recibo').style.display = 'none';
}

function imprimirRecibo() {
    window.print();
}

// Event listeners
document.getElementById('reciboForm').addEventListener('submit', function(e) {
    e.preventDefault();
    gerarRecibo();
});

// Formatação automática de CPF/CNPJ
function formatarCpfCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        // CPF
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ
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

// Formatação de telefone
document.getElementById('telefone').addEventListener('input', function() {
    let value = this.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
    this.value = value;
});