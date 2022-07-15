class CalcControler {

    // Construtor da Calculadora
    constructor() {

        // Parâmetros (o _ no parâmetro indica que ele é privado)
        this._audio = new Audio("click.mp3");
        this._audioOnOff = false;
        this._lastOperator = "";
        this._lastNumber = "";

        this._operation = [];
        this._locale = "pt-BR";
        this._displayCalcEl = document.querySelector("#display");
        this._dateCalcEl = document.querySelector("#data");
        this._timeCalcEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    // Métodos principais
    initialize() {
        this.setDisplayDateTime();

        // Função que retorna a data e o horário atual, atualizando a cada segundo
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll(".btn-ac").forEach(btn => {

            btn.addEventListener("dblclick", e => {

                this.toggleAudio();
            });
        });
    }

    toggleAudio() {
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {
        if (this._audioOnOff) {

            this._audio.currentTime = 0;

            this._audio.play();
        
        }
    }

    initKeyboard() {
        document.addEventListener("keyup", e => {

            this.playAudio();

            switch (e.key) {

                case "Escape":
                    this.clearAll();    
                    break;

                    
                case "Backspace":
                    this.cancelEntry();    
                    break;

                    
                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                    this.addOperation(e.key);
                    break;
                    
                case "Enter":
                case "=":
                    this.calc();
                    break;

                case ".":
                case ",":
                    this.addDot(".");
                    break;

                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.addOperation(parseInt(e.key));
                    break;

                case "c":
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    pasteFromClipboard() {
        document.addEventListener("paste", e => {

           let text =  e.clipboardData.getData("Text");
           
           this.displayCalc = parseFloat(text);
        });
    }

    copyToClipboard() {
        let input = document.createElement("input");

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }
    

    // Métodos complementares
    addEventListenerAll(element, events, fn) {

        // Converte a string de eventos para um array e adiciona um evento para cada item dele
        events.split(" ").forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        // Zera a operação
        this._operation = [];
        this._lastNumber = [];
        this._lastOperator = [];
        this.setLastNumberToDisplay();
    }

    cancelEntry() {
        // Cancela a ultima operação
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    getLastOperation() {
        // Retorna o ultimo item da operação
        return this._operation[this._operation.length - 1];
    }

    isOperator(value) {
        // Verifica se o último item da operação é um operador
        return (["+", "-", "*", "%", "/"].indexOf(value) > -1 );
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    pushOperation(value) {
        // Faz o push dos itens dentro do array
        this._operation.push(value);

        if (this._operation.length > 3) {
            this.calc();
        }
    }
    
    getLastItem(isOperator = true) {
        let lastItem;

        // Recupera o tamanho do array
        for (let i = this._operation.length - 1; i >= 0; i--) {

                if (this.isOperator(this._operation[i]) == isOperator) {
                    lastItem = this._operation[i]; // Recupera o último operador ou o último número do array
                    break;
                }
            }

            // Verifica se há um operador ou um número na operação ainda, caso não haja, ele mantém o anterior
            if (!lastItem) {
                lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            }

            return lastItem;
        }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        // Caso seja vazio, 'lastNumber' receberá um valor 0
        if (!lastNumber) lastNumber = 0;

        // Atualiza o display
        this.displayCalc = lastNumber;
    }

    getResult() {
        try {
            return eval(this._operation.join(""));

        } catch (e) {
            setTimeout(() => {
                this.setError();
            }, 1);
        }
    }
    
    calc() {
        let last = "";

        // Recupera o último operador da operação
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3) {
            // Retira o último item adicionado no array caso tenha mais de 3 itens dentro dele
            last = this._operation.pop();

            // Guarda o resultado da operação para o botão de igual(=)
            this._lastNumber = this.getResult();
        
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false); // Recupera o último número da operação
        }

        //Converte o array para uma string, realizando a operação
        let result = this.getResult();
        
        if (last == "%") {
            result /= 100;

            this._operation = [result];

        } else {
            // Cria um novo array adicionando o resultado da operação e o último item que havia sido retirado
            this._operation = [result];

            // Se o valor de 'last' for diferente de vazio, será adicionado ao novo array
            if (last) this._operation.push(last);
        }
        
        // Atualiza o display após realizar a operação
        this.setLastNumberToDisplay();
    }

    addOperation(value) {
        if (isNaN(this.getLastOperation())) {
            
            if (this.isOperator(value)){
                // Se a última operação for um operador, ele irá trocar seu valor
                this.setLastOperation(value);

            } else {
                this.pushOperation(value);
                
                this.setLastNumberToDisplay();
            }


        } else {
            if (this.isOperator(value)) {
                // Caso o último item seja um operador, irá ser adicionado ao array
                this.pushOperation(value);

            } else {
                // Faz a concatenação da última operação com a nova, criando uma outra
                let newValue = this.getLastOperation().toString() + value.toString();
                
                //Adiciona uma operação
                this.setLastOperation(newValue);

                // Atualiza o display
                this.setLastNumberToDisplay();
            }
        }
    }

    addDot() {
        let lastOperation = this.getLastOperation();

        // Verifica se ja há algum ponto na operação, impedindo que seja adicionado mais de 1
        if (typeof lastOperation === "string" && lastOperation.split("".indexOf(".")) > -1) return;
        
        // Verifica se o último item da operação é um operador ou um valor vazio, caso seja, adiciona a string '0.'
        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation("0.");

        } else {
            // Caso seja um número, ele concatenará o número com um '.'
            this.setLastOperation(lastOperation.toString() + ".");
        }

        // AO final, atualiza o display
        this.setLastNumberToDisplay();
    }

    setError() {
        this.displayCalc = "Error";
    }

    execBtn(value) {
        this.playAudio();

        switch (value) {

            case "ac":
                this.clearAll();    
                break;

                
            case "ce":
                this.cancelEntry();    
                break;

                
            case "soma":
                this.addOperation("+");
                break;
                
            case "subtracao":
                this.addOperation("-");
                break;
                
            case "divisao":
                this.addOperation("/");
                break;
                
            case "multiplicacao":
                this.addOperation("*");
                break;
                
            case "porcento":
                this.addOperation("%");
                break;
                
            case "igual":
                this.calc();
                break;

            case "ponto":
                this.addDot(".");
                break;

            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.addOperation(parseInt(value));
                break;
                

            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        // Recupera todos os elementos de tag 'g' dentro dos Id's informados
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        // Percorre o Array retornado com os botões e adiciona um evento para cada um deles
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-", ""); // Retorna apenas o nome da classe do btn clicado
           
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        })
    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    // Métodos Get e Set
    get displayTime() {
        return this._timeCalcEl.innerHTML;
    }

    set displayTime(value) {
        return this._timeCalcEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateCalcEl.innerHTML;
    }

    set displayDate(value) {
        return this._dateCalcEl.innerHTML = value;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {
        if (value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }


    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = currentDate;
    }








}